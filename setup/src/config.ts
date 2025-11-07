import { config } from "dotenv";

// Load environment variables
config({});

// Validate and export required environment variables
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const SUI_NETWORK = requireEnv("SUI_NETWORK");
export const ADMIN_ADDRESS = requireEnv("ADMIN_ADDRESS");
export const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "";

// Validation logging
console.log("✓ Environment variables loaded:");
console.log("  - SUI_NETWORK:", SUI_NETWORK);
console.log("  - ADMIN_ADDRESS:", ADMIN_ADDRESS);
console.log("  - ADMIN_SECRET_KEY:", ADMIN_SECRET_KEY ? "✓ present" : "⚠ not set");