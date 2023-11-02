import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceRecomputeTSAll = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();

    const handleRecomputeTotalScore = async(
        adminCap: string, 
        service: string,
        setIsLoading: any) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::service::recompute_ts_for_all`,
            arguments: [
                tx.object(adminCap),
                tx.object(service),
            ],
        });
        setIsLoading(true);
        console.log("recompute all total score, signing transaction block...");
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
                    console.log("Total score updated");
                    toast.success("Total score updated");
                    return
                } else {
                    console.log("Total score update failed");
                    toast.error("Total score update failed.");
                    return
                }
            }).catch((err) => {
                setIsLoading(false);
                console.log("Total score update failed");
                console.log(err);
                toast.error("Something went wrong, Total score update failed.");
            });
        })
    };
    return { handleRecomputeTotalScore };
}