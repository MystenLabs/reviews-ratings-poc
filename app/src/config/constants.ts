/**
 * Network-specific constants for the Reviews & Ratings platform
 *
 * These values are set after deploying to each network:
 * 1. Deploy contract: ./setup/publish.sh [network]
 * 2. Create dashboard: Call create_dashboard() PTB
 * 3. Update the corresponding config object here with the new IDs
 */

export const LOCALNET_CONFIG = {
  packageId: "0x_REPLACE_AFTER_DEPLOYMENT",
  dashboardId: "0x_REPLACE_AFTER_CREATE_DASHBOARD",
};

export const DEVNET_CONFIG = {
  packageId: "0x_REPLACE_AFTER_DEPLOYMENT",
  dashboardId: "0x_REPLACE_AFTER_CREATE_DASHBOARD",
};

export const TESTNET_CONFIG = {
  packageId: "0x_REPLACE_AFTER_DEPLOYMENT",
  dashboardId: "0x_REPLACE_AFTER_CREATE_DASHBOARD",
};

export const MAINNET_CONFIG = {
  packageId: "0x_REPLACE_AFTER_DEPLOYMENT",
  dashboardId: "0x_REPLACE_AFTER_CREATE_DASHBOARD",
};
