import { useWalletKit } from "@mysten/wallet-kit"
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useServiceRecomputeTSAll = () => {
    const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();
    const handleRecomputeTotalScore = async(
        adminCap: string, 
        service: string,
        setIsLoading: any
        ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::recompute_ts_for_all`,
            arguments: [
                tx.object(adminCap),
                tx.object(service),
            ],
        });
        setIsLoading(true);
        console.log("recompute all total score, signing transaction block...");
        return handleSignAndExecuteTransaction(tx, "Service Recompute Total Score", setIsLoading);
    };
    return { handleRecomputeTotalScore };
}