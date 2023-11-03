import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServicePoEGeneration = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();

    // const handleServicePoEGeneration = async(
    //     setIsLoading: any
    //     // need to add arguments here
    // ) => {
    //     const tx = new TransactionBlock();
    //     tx.moveCall({
    //       target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::generate_proof_of_experience`,
    //       arguments: [

    //         // need to add arguments here
    //       ],
    //     });
    //     setIsLoading(true);
    //     console.log("generate proof of experience, signing transaction block...");
    //     return signTransactionBlock({
    //         transactionBlock: tx,
    //         })
    //         .then((signedTx: any) => {
    //         return executeSignedTransactionBlock({
    //             signedTx,
    //             requestType: "WaitForLocalExecution",
    //             options: {
    //             showEffects: true,
    //             showEvents: true,
    //             },
    //         })
    //         .then((resp) => {
    //             setIsLoading(false);
    //             console.log(resp);
    //             if (resp.effects?.status.status === "success") {
    //                 console.log("Proof of experience generated");
    //                 toast.success("Proof of experience generated");
    //                 return 
    //             } else {
    //                 console.log("Proof of experience generation failed");
    //                 toast.error("Proof of experience generation failed.");
    //                 return
    //             }
    //         })
    //         .catch((err) => {
    //             setIsLoading(false);
    //             console.log("Proof of experience generation failed");
    //             console.log(err);
    //             toast.error("Something went wrong, Proof of experience generation failed.");
    //             });
    //         })
    // }
    // return { handleServicePoEGeneration };

}