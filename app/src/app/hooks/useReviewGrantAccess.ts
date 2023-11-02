import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewGrantAccess = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleReviewAccessGrant = async(
    review: string,
    payment: number,
    recipient: string,
    setIsLoading: any
    ) => {
      const tx = new TransactionBlock();
      // split payment amount from balance. 
      const sendTipAmount = await tx.splitCoins(tx.gas, [tx.pure(payment)]);
      // start to set up transaction block
      tx.moveCall({
        target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::grant_access_to`,
        arguments: [
          tx.object(review),
          sendTipAmount,
          tx.pure(recipient),
        ],
      });

      setIsLoading(true);
      console.log("Grant access, signing transaction block...");
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
            setIsLoading(false);
            console.log(resp);
            if (resp.effects?.status.status === "success") {
              console.log("Access granted");
              toast.success("Access granted");
              return
            } else {
              console.log("Access grant failed");
              toast.error("Access grant failed.");
              return
            }
          })
            .catch((err) => {
              setIsLoading(false);
              console.log("Access grant failed");
              console.log(err);
              toast.error("Something went wrong, Access grant failed.");
          });
        })
    }
    return { handleReviewAccessGrant }
}

