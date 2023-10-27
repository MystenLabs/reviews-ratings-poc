import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";


export const useReviewLocking = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    const [isLoading, setIsLoading] = useState(false);

    const locking = async(reviewObj: string) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::calculate_ts`,
            arguments: [
                tx.object(reviewObj),
            ],
        });
        setIsLoading(true);
        console.log("useReviewLocking, signing transaction block...");
        const signedTx = await signTransactionBlock({
            transactionBlock: tx,
        });
        const resp = await executeSignedTransactionBlock({
            signedTx,
            requestType: "WaitForLocalExecution",
            options: {
                showEffects: true,
                showEvents: true,
            },
        });
        console.log(resp);
        return resp;
    }

};