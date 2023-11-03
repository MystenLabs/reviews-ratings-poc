import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useReviewGrantAccess = () => {
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleReviewAccessGrant = async (
    review: string,
    payment: number,
    recipient: string,
    setIsLoading: any,
  ) => {
    const tx = new TransactionBlock();
    // split payment amount from balance.
    const sendTipAmount = tx.splitCoins(tx.gas, [tx.pure(payment)]);
    // start to set up transaction block
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::review::grant_access_to`,
      arguments: [tx.object(review), sendTipAmount, tx.pure(recipient)],
    });

    tx.setGasBudget(1000000000);
    setIsLoading(true);
    console.log("Grant access, signing transaction block...");
    return handleSignAndExecuteTransaction(
      tx,
      "ReviewAccessGrant",
      setIsLoading,
    );
  };

  return { handleReviewAccessGrant };
};
