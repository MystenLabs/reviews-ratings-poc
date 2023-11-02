import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceReorder = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    

    const handleServiceReviewReordering = async(
        serviceObj: string, 
        review: string,
        setIsLoading: any) => {
        const tx = new TransactionBlock();
        tx.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::service::reorder`,
          arguments: [
            tx.object(serviceObj),
            tx.object(review),
          ],
        });
        setIsLoading(true);
        console.log("reorder, signing transaction block...");
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
                    console.log("Reorder success");
                    toast.success("Reorder success");
                    return 
                } else {
                    console.log("Reorder failed");
                    toast.error("Reorder failed.");
                    return
                  }
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log("Reorder failed");
                    console.log(err);
                    toast.error("Something went wrong, Reorder failed.");
                });
            })
            .catch(() => {
                setIsLoading(false);
                console.log("Error while signing tx");
            });
    }
    return { handleServiceReviewReordering }


}
