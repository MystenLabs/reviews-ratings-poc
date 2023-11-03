import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useSignAndExecuteTransaction = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    const handleSignAndExecuteTransaction = async (
        tx: TransactionBlock,
        operation: String, 
        setIsLoading: any
    ) => {
        return signTransactionBlock({
            transactionBlock: tx,
        }).then((signedTx: any) => {
            return executeSignedTransactionBlock({
                signedTx,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            }).then((resp) => {
                setIsLoading(false);
                console.log(resp);
                if (resp.effects?.status.status === "success") {
                    console.log(`${operation} operation successful`);
                    toast.success(`${operation} operation successful`);
                    return
                } else {
                    console.log(`${operation} operation failed`);
                    toast.error(`${operation} operation failed.`);
                    return
                }
            }).catch((err) => {
                setIsLoading(false);
                console.log(`${operation} operation failed`);
                console.log(`${operation} error : `,err);
                toast.error(`Something went wrong, ${operation} operation failed.`);
            });
        }).catch((err) => {
            setIsLoading(false);
            console.log(`signing goes wrong ${operation} error : `,err);
            toast.error(`signing goes wrong, ${operation} operation failed.`);
        }); // <-- added missing semicolon here
    }
    return { handleSignAndExecuteTransaction }
}