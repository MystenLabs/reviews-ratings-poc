import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import {
  LOCALNET_CONFIG,
  DEVNET_CONFIG,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
} from "./constants";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    localnet: {
      url: getFullnodeUrl("localnet"),
      variables: LOCALNET_CONFIG,
    },
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: DEVNET_CONFIG,
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: TESTNET_CONFIG,
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: MAINNET_CONFIG,
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
