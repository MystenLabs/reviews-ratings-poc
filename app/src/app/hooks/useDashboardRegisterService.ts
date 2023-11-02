import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

// has to be async
export const useDashboardRegisterService = (dashboard_obj: any ,service_id: string ) => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::dashboard::register_service`,
    arguments: [
      tx.object(dashboard_obj),
      tx.pure(service_id),
    ],
  });
  setIsLoading(true);
  console.log("useDashboardRegisterService, signing transaction block...");
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
            console.log("Service registered");
            toast.success("Service registered");
            return 
          } else {
            console.log("Service registered to dashboard failed");
            toast.error("Service registered to dashboard failed.");
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.log("Service registered to dashboard failed");
          console.log(err);
          toast.error("Something went wrong, Service could not be registered.");
        });
    })
    .catch(() => {
      setIsLoading(false);
      console.log("Error while signing tx");
    });
};

