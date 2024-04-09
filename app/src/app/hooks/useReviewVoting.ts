import { useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useReviewVoting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleUpvote = async (serviceId: string, reviewId: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::upvote`,
      arguments: [tx.object(serviceId), tx.pure(reviewId)],
    });
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::reorder`,
      arguments: [tx.object(serviceId), tx.pure(reviewId)],
    });
    return handleSignAndExecuteTransaction(tx, "Upvote", setIsLoading);
  };

  const handleDownvote = async (serviceId: string, reviewId: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::downvote`,
      arguments: [tx.object(serviceId), tx.pure(reviewId)],
    });
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::reorder`,
      arguments: [tx.object(serviceId), tx.pure(reviewId)],
    });
    return handleSignAndExecuteTransaction(tx, "Downvote", setIsLoading);
  };

  return { handleUpvote, handleDownvote };
};
