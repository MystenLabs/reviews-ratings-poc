import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit"
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewUpdateTotalScore = (review_obj: string) => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

    const update = async(reviewObj: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::update_total_score`,
          arguments: [
            tx.object(review_obj),
          ],
        });
        setIsLoading(true);
        console.log("update total score, signing transaction block...");
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
                    console.log("Total score updated");
                    toast.success("Total score updated");
                    return 
                } else {
                    console.log("Total score update failed");
                    toast.error("Total score update failed.");
                    return
                  }
                })
                .catch((err) => {
                    setIsLoading(false);
                    console.log("Total score update failed");
                    console.log(err);
                    toast.error("Something went wrong, Total score update failed.");
                });
            })
            .catch(() => {
                setIsLoading(false);
                console.log("Error while signing tx");
            });
        }

}