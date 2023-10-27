import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit"
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewCalculateTS = (review_obj: string) => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const tx = new TransactionBlock();
  tx.moveCall({
    target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::calculate_ts`,
    arguments: [
      tx.object(review_obj),
    ],
  });
  setIsLoading(true);
  console.log("useReviewCalculateTS, signing transaction block...");
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
            console.log("Review locked");
            toast.success("Review locked.");
            return 
          } else {
            console.log("Review locking failed");
            toast.error("Review locking failed.");
          }
        })
        .catch((err) => {
          setIsLoading(false);
          console.log("Review locking failed");
          console.log(err);
          toast.error("Something went wrong, Review could not be locked.");
        });
    })
    .catch(() => {
      setIsLoading(false);
      console.log("Error while signing tx");
    });
}