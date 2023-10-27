import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";


export const useDashboardCreation = () => {
  const { currentAccount } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);
  

  };
