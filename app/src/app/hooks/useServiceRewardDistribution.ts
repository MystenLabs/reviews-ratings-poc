import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useServiceReviewDistribution = () => {
    const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();
    const handleRewardDistribution = async(
        adminCap:string, 
        reviewObj: string,
        setIsLoading: any) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::distribute_reward`,
            arguments: [
                tx.object(adminCap),
                tx.object(reviewObj),
            ],
        });
        setIsLoading(true);
        console.log("distribute reward, signing transaction block...");
        return handleSignAndExecuteTransaction(tx, "Service Review Distribution", setIsLoading);
    }
    return { handleRewardDistribution };

}