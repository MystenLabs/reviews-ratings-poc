import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewGrantAccess = (
    review_obj: any ,
    payment: number,
    recipient: string ) => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const tx = new TransactionBlock();
  const sendReviewTip = tx.splitCoins(tx.gas, [tx.pure(payment)]);

  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::grant_access_to`,
    arguments: [
      tx.object(review_obj),
      sendReviewTip,
      tx.pure(recipient),
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

