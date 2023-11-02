import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
export const useServiceWriteReview = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();

    const execute_review_write_transaction = async (
        tx: TransactionBlock,
        setIsLoading: any) => {
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
                    console.log("New review written");
                    toast.success("New Review written");
                    return
                } else {
                    console.log("New Review write failed");
                    toast.error("New Review write failed.");
                    return
                }
            }).catch((err) => {
                setIsLoading(false);
                console.log("New Review write failed");
                console.log(err);
                toast.error("Something went wrong, Review New write failed.");
            });
        });
    }

    const HandleWriteReview = async(
        adminCap: string,
        serviceObj: string, 
        serviceOwnerAddress: string, 
        reviewHash: Uint8Array,
        review: string,
        setIsLoading: any) => {
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::write_new_review`,
                arguments: [
                    tx.object(adminCap),
                    tx.object(serviceObj),
                    tx.pure(serviceOwnerAddress),
                    tx.pure(reviewHash),
                    tx.pure(reviewHash.length),
                    tx.object(SUI_CLOCK_OBJECT_ID),
                ],
            });
            setIsLoading(true);
            console.log("write new Review, signing transaction block...");
            return execute_review_write_transaction(tx, setIsLoading);
        }

    const HandleWriteReviewWithoutPoE = async(       
        serviceObj: string, 
        serviceOwnerAddress: string, 
        reviewHash: Uint8Array,
        review: string,
        setIsLoading: any
    ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::write_new_review_without_poe`,
            arguments: [
                tx.object(serviceObj),
                tx.pure(serviceOwnerAddress),
                tx.pure(reviewHash),
                tx.pure(reviewHash.length),
                tx.object(SUI_CLOCK_OBJECT_ID),
            ],
        });
        setIsLoading(true);
        console.log("write new Review, signing transaction block...");
        return execute_review_write_transaction(tx,setIsLoading);
    }

    return { HandleWriteReview, HandleWriteReviewWithoutPoE }
};