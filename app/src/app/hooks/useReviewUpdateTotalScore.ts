import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useReviewUpdateTotalScore = () => {
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction(); 
    const handleUpdateReviewTotalScore = async(
      reviewObj: string,
      setIsLoading: any
      ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE}::review::update_total_score`,
          arguments: [
            tx.object(reviewObj),
          ],
        });
        setIsLoading(true);
        console.log("update total score, signing transaction block...");
        return handleSignAndExecuteTransaction(tx, "Review Update Total Score", setIsLoading);
      }
    return { handleUpdateReviewTotalScore }
}