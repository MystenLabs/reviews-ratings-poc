import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit"
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";

const exmapleHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
// has to be async
export const useReviewAddNew = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();
    const [isLoading, setIsLoading] = useState(false);
    const tx = new TransactionBlock();
    
    const handleAddNewReview = async (
        owner_address: string, 
        service_id: string, 
        hash: string, 
        length: number, 
        has_poe: boolean
    ) : Promise<[string, number]> => {
        try{
            tx.moveCall({
                target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::review::new_review`,
                arguments: [
                    tx.object(owner_address),
                    tx.object(service_id),
                    tx.pure(hash), // has to be changed to something compatible with vector<u8>,
                    tx.pure(length),
                    tx.pure(has_poe),
                    tx.object(SUI_CLOCK_OBJECT_ID),
                ],
            });
            setIsLoading(true);
            console.log("addReview, signing transaction block...");
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
            
            if (resp.effects?.status.status === "success") {
                setIsLoading(false);
                console.log("Review newly created");
                toast.success("Review newly created.");
                return ["", 0] 
            } else {
                setIsLoading(false);
                console.log("Review creation failed");
                toast.error("Review creation failed.");
                return ["", 0]
            }
        }catch(err) {
            setIsLoading(false);
            console.log("Review creation failed");
            console.log(err);
            toast.error("Review creation failed.");
            return ["", 0]
        }
    }
    return { handleAddNewReview }

};