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
  tx.transferObjects([sendReviewTip], tx.pure(recipient),);
  console.log("useReviewGrantAccess, signing transaction block...");
  const signedTx =  signTransactionBlock({
    transactionBlock: tx,
  });
  const resp = executeSignedTransactionBlock({
    signedTx,
    requestType: "WaitForLocalExecution",
    options: {
      showEffects: true,
      showEvents: true,
    },
  });
  console.log(resp);
  return 
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
            console.log("user granted access to review");
            toast.success("user granted access to review");
            return 
          } else {
            console.log("user granted access to review failed");
            toast.error("user granted access to review failed");
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.log("user granted access to review failed");
          console.log(err);
          toast.error("Something went wrong,user granted access to review failed.");
        });
    })
    .catch(() => {
      setIsLoading(false);
      console.log("Error while signing tx");
    });
};

