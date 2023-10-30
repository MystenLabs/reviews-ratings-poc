import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";


export const useReviewVoting = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    const [isLoading, setIsLoading] = useState(false);

    const upvote_tx_block = async(reviewObj: string): Promise<TransactionBlock> => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::upvote`,
            arguments: [
                tx.object(reviewObj),
            ],
            });
        return tx;
    }

    const downvote_tx_block = async(reviewObj: string): Promise<TransactionBlock> => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::downvote`,
            arguments: [
                tx.object(reviewObj),
            ],
            });
        return tx;
    }

    const excute_vote_transaction = async (tx: TransactionBlock) => {
        
    
    }

    
    



};