#!/bin/bash
set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
error() {
  echo -e "${RED}ERROR: $1${NC}" >&2
  exit 1
}

info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================================
# 1. DEPENDENCY CHECKS
# ============================================================================
info "Checking dependencies..."
for dep in jq sui bc; do
  if ! command -v ${dep} &>/dev/null; then
    error "${dep} is not installed. Please install it and try again."
  fi
done
success "All dependencies available"

# ============================================================================
# 2. ENVIRONMENT VALIDATION
# ============================================================================
info "Validating environment variables..."

if [ -z "$ADMIN_PHRASE" ]; then
  error "ADMIN_PHRASE environment variable is not set"
fi

success "Environment variables validated"

# ============================================================================
# 3. NETWORK CONFIGURATION
# ============================================================================
MOVE_PACKAGE_PATH=../move/reviews_rating

# If network argument provided, switch to it first
if [ $# -ne 0 ]; then
  NETWORK_NAME=$1
  info "Switching to network: ${NETWORK_NAME}"
  if ! sui client switch --env ${NETWORK_NAME} &>/dev/null; then
    error "Failed to switch to network: ${NETWORK_NAME}. Available environments: $(sui client envs 2>&1 | grep -v "╭\|╰\|│" | awk '{print $1}')"
  fi
fi

# Get the actual active environment from sui client (only stdout, ignore warnings)
NETWORK_NAME=$(sui client active-env 2>/dev/null)
if [ -z "$NETWORK_NAME" ] || [[ "$NETWORK_NAME" == *"Error"* ]]; then
  error "Failed to determine active sui client environment"
fi

# Set env file suffix based on network
if [ "$NETWORK_NAME" = "localnet" ]; then
  ENV_SUFFIX=".localnet"
else
  ENV_SUFFIX=""  # testnet/devnet/mainnet use .env without suffix
fi

info "Deploying to: ${NETWORK_NAME}"

# ============================================================================
# 4. MOVE PACKAGE VALIDATION
# ============================================================================
if [ ! -d "$MOVE_PACKAGE_PATH" ]; then
  error "Move package not found at: ${MOVE_PACKAGE_PATH}"
fi

if [ ! -f "$MOVE_PACKAGE_PATH/Move.toml" ]; then
  error "Move.toml not found in: ${MOVE_PACKAGE_PATH}"
fi

success "Move package found"

# ============================================================================
# 5. KEYPAIR SETUP & ADDRESS DERIVATION
# ============================================================================
info "Setting up keypair..."

# Import keypair and capture output
import_output=$(sui keytool import "$ADMIN_PHRASE" ed25519 2>&1)

# Extract address from import output
# The output contains a line like: "Imported address: 0xabc123..."
ADMIN_ADDRESS=$(echo "$import_output" | grep -oE '0x[a-fA-F0-9]{64}' | head -1)

if [ -z "$ADMIN_ADDRESS" ]; then
  # Keypair might already be imported, try to get address from keystore
  warn "Keypair already imported, retrieving address from keystore..."

  # List addresses and find the one matching our mnemonic (sui keytool list shows all addresses)
  # For now, we'll use the active address
  ADMIN_ADDRESS=$(sui client active-address 2>&1)

  if [ -z "$ADMIN_ADDRESS" ] || [[ "$ADMIN_ADDRESS" == *"Error"* ]]; then
    error "Failed to derive admin address from keypair. Please check your ADMIN_PHRASE."
  fi
fi

info "Derived Admin Address: ${ADMIN_ADDRESS}"

# Switch to admin address
if ! sui client switch --address ${ADMIN_ADDRESS} &>/dev/null; then
  error "Failed to switch to address: ${ADMIN_ADDRESS}"
fi

success "Keypair configured"

# ============================================================================
# 6. PUBLISH CONTRACT
# ============================================================================
info "Publishing Move package..."

if ! publish_res=$(sui client publish --skip-fetch-latest-git-deps --gas-budget 2000000000 --json ${MOVE_PACKAGE_PATH} 2>&1); then
  error "Contract publishing failed:\n${publish_res}"
fi

# Extract only the JSON part (starts with '{' and ends with '}')
# This filters out warning messages that may appear before the JSON
publish_json=$(echo "$publish_res" | sed -n '/{/,/^}$/p')

# Save full publish result
echo "${publish_json}" > .publish.res.json
success "Contract published"

# ============================================================================
# 7. EXTRACT DEPLOYMENT DATA
# ============================================================================
info "Extracting deployment data..."

# Extract Package ID
PACKAGE_ID=$(echo "$publish_json" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" = "null" ]; then
  error "Failed to extract PACKAGE_ID from deployment"
fi

# Extract actual gas paid from balance changes (most accurate)
GAS_USED=$(echo "$publish_json" | jq -r '[.balanceChanges[] | select(.coinType == "0x2::sui::SUI") | .amount] | map(tonumber) | add | fabs')

# Note: Dashboard ID is not available at publish time
# It must be created separately by calling create_dashboard() from the frontend or setup script

success "Deployment data extracted"

# ============================================================================
# 8. WRITE CONFIGURATION FILES
# ============================================================================
info "Writing configuration files..."

# Write setup/deployment.env (deployment info - not credentials)
cat > deployment.env <<-DEPLOY_ENV
# Auto-generated by publish.sh on $(date)
# Network: ${NETWORK_NAME}
DEPLOYED_PACKAGE_ID=${PACKAGE_ID}
DEPLOYED_ADMIN_ADDRESS=${ADMIN_ADDRESS}
DEPLOYED_NETWORK=${NETWORK_NAME}
DEPLOYED_GAS_USED=${GAS_USED}
DEPLOY_ENV

# Write app/.env (minimal - only deployment-specific values)
cat > ../app/.env${ENV_SUFFIX} <<-APP_ENV
NEXT_PUBLIC_PACKAGE=${PACKAGE_ID}
APP_ENV

success "Configuration files written"

# ============================================================================
# 9. DEPLOYMENT SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}           DEPLOYMENT SUCCESSFUL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Network:${NC}       ${NETWORK_NAME}"
echo -e "${BLUE}Package ID:${NC}    ${PACKAGE_ID}"
echo -e "${BLUE}Admin Address:${NC} ${ADMIN_ADDRESS}"
GAS_IN_SUI=$(echo "scale=4; ${GAS_USED} / 1000000000" | bc)
echo -e "${BLUE}Gas Used:${NC}      ${GAS_USED} MIST (~${GAS_IN_SUI} SUI)"
echo ""
warn "Dashboard must be created separately by calling create_dashboard()"
echo ""
echo -e "${BLUE}Generated Files:${NC}"
echo "  - setup/.publish.res.json (full deployment data)"
echo "  - setup/deployment.env (deployment summary)"
echo "  - app/.env${ENV_SUFFIX} (frontend config)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# 10. POST-DEPLOYMENT SETUP (OPTIONAL)
# ============================================================================
if [ -n "$RUN_SETUP" ] && [ "$RUN_SETUP" = "true" ]; then
  info "Running post-deployment setup..."
  pnpm run setup
fi

success "Deployment complete!"
