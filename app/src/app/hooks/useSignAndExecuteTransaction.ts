import { useSignAndExecuteTransaction as useDappKitSignAndExecute } from "@mysten/dapp-kit";
import { toast } from "react-hot-toast";
import { Transaction } from "@mysten/sui/transactions";

/**
 * Wrapper around dapp-kit's useSignAndExecuteTransaction with toast notifications
 *
 * Migration from old pattern:
 * - useWalletKit + manual signing → useSignAndExecuteTransaction from dapp-kit
 * - transactionBlock parameter → transaction parameter
 * - Returns { digest, effects } automatically
 */
export const useSignAndExecuteTransaction = () => {
    const { mutate: signAndExecuteTransaction } = useDappKitSignAndExecute();

    const handleSignAndExecuteTransaction = async (
        tx: Transaction,
        operation: string,
        setIsLoading?: (loading: boolean) => void
    ) => {
        signAndExecuteTransaction(
            {
                transaction: tx,
            },
            {
                onSuccess: (result) => {
                    if (setIsLoading) setIsLoading(false);
                    console.log(`${operation} operation successful`, result);
                    toast.success(`${operation} operation successful`);
                },
                onError: (error) => {
                    if (setIsLoading) setIsLoading(false);
                    console.error(`${operation} operation failed`, error);
                    toast.error(`${operation} operation failed.`);
                },
            }
        );
    };

    return { handleSignAndExecuteTransaction };
};