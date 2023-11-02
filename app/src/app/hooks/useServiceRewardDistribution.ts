import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceReviewDistribution = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();

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
                    console.log("Reward distributed");
                    toast.success("Reward distributed");
                    return
                } else {
                    console.log("Reward distribution failed");
                    toast.error("Reward distribution failed.");
                    return
                }
            }).catch((err) => {
                setIsLoading(false);
                console.log("Reward distribution failed");
                console.log(err);
                toast.error("Something went wrong, Reward distribution failed.");
            });
        })
    }
    return { handleRewardDistribution };

}