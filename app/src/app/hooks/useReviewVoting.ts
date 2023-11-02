import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";


export const useReviewVoting = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    const [isLoading, setIsLoading] = useState(false);

    const upvote_tx_block = async(reviewObj: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::upvote`,
            arguments: [
                tx.object(reviewObj),
            ],
            });
        excute_vote_transaction(tx);
    }

    const downvote_tx_block = async(reviewObj: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::downvote`,
            arguments: [
                tx.object(reviewObj),
            ],
            });
        excute_vote_transaction(tx);
    }

    const excute_vote_transaction = async (tx: TransactionBlock) => {
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
    
};

    
    



