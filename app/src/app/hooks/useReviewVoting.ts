import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useReviewVoting = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();

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
    return handleSignAndExecuteTransaction(tx, "Upvote", setIsLoading);
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
    return handleSignAndExecuteTransaction(tx, "Upvote", setIsLoading);
  };



  return { handleUpvote, handleDownvote };
};
