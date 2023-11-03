import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewVoting = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async (serviceId: string, reviewId: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::review::upvote`,
      arguments: [tx.object(reviewId)],
    });
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::reorder`,
      arguments: [tx.object(serviceId), tx.object(reviewId)],
    });
    await execute_vote_transaction(tx);
  };

  const handleDownvote = async (serviceId: string, reviewId: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::review::downvote`,
      arguments: [tx.object(reviewId)],
    });
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::reorder`,
      arguments: [tx.object(serviceId), tx.object(reviewId)],
    });
    await execute_vote_transaction(tx);
  };

  const execute_vote_transaction = async (tx: TransactionBlock) => {
    tx.setGasBudget(1000000000);
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
              return;
            } else {
              console.log("Total score update failed");
              toast.error("Total score update failed.");
              return;
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
  };

  return { handleUpvote, handleDownvote };
};
