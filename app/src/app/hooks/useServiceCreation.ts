import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionArgument, TransactionBlock, Transactions } from "@mysten/sui.js/transactions";

export const useServiceCreation = () => {

    const handleServiceCreationTransactionResult = async(
        name: String,
        setIsLoading: any): Promise<any> => {
        const tx = new TransactionBlock();
        const serviceCreationTxResult = tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::create_service`,
            arguments: [
                tx.pure(name),
            ],
            });
            setIsLoading(true);
            console.log("Create Service, signing transaction block...");
            return serviceCreationTxResult
        }
    const handleServiceCreationTransactionBlock = async(
        name: String,
        setIsLoading: any): Promise<TransactionBlock> => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::create_service`,
            arguments: [
                tx.pure(name),
            ],
        });
        setIsLoading(true);
        console.log("Create Service, signing transaction block...");
        return tx;
    }
    return { handleServiceCreationTransactionResult, handleServiceCreationTransactionBlock }

}