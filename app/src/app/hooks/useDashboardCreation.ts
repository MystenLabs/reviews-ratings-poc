import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

// has to be async
export const useDashboardCreation = (service_type: string ) => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::dashboard::create_dashboard`,
    arguments: [
      tx.pure(service_type),
    ],
  });
  setIsLoading(true);
  console.log("useDashboardCreation, signing transaction block...");
  return signTransactionBlock({
    transactionBlock: tx,
  })
    .then((signedTx: any) => {
      return executeSignedTransactionBlock({
        signedTx,
        requestType: "WaitForLocalExecution",
        options: {
          showEffects: true,
          showEvents: true,
        },
      })
        .then((resp) => {
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Dashboard created");
            toast.success("Dashboard created.");
            return 
          } else {
            console.log("Dashboard creation failed");
            toast.error("Dashboard creation failed.");
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.log("Dashboard creationg failed");
          console.log(err);
          toast.error("Something went wrong, Dashboard could not be created.");
        });
    })
    .catch(() => {
      setIsLoading(false);
      console.log("Error while signing tx");
    });
};

