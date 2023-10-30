import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceCreation = () => {
    const { executeSignedTransactionBlock } = useSui();
    const { signTransactionBlock } = useWalletKit();

    const handleServiceCreation = async(
        name: String,
        setIsLoading: any): Promise<string> => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::service::create_service`,
            arguments: [
                tx.pure(name),
            ],
            });
            setIsLoading(true);
            console.log("Create Service, signing transaction block...");
            return signTransactionBlock({
                transactionBlock: tx,
              })
              .then((signedTx: any) => {
                return executeSignedTransactionBlock({
                    signedTx,
                    requestType: "WaitForLocalExecution",
                    options: {
                      showEffects: true,
                      showEvents: true,
                    },
                  })
                  .then((resp) => {
                    setIsLoading(false);
                    console.log(resp);
                    if (resp.effects?.status.status === "success") {
                        console.log("Service created");
                        toast.success("Service created");
                        return ""
                    } else {
                        console.log("Create Service failed");
                        toast.error("Create Service failed.");
                        return ""
                      }
                    })
                    .catch((err) => {
                        setIsLoading(false);
                        console.log("Create Service failed");
                        console.log(err);
                        toast.error("Something went wrong, Create Service failed.");
                        return ""
                    });
                })
                .catch(() => {
                    setIsLoading(false);
                    console.log("Error while signing tx");
                    return ""
                });
            }
    return { handleServiceCreation }

}