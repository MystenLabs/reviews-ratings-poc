import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useWalletKit } from "@mysten/wallet-kit"
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";

const exmapleHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
// has to be async
export const useReviewAddNew = (
    owner_address: string,
    service_id: string, 
    hash: string, 
    length: number,
    has_poe: boolean, 
     ) : [string, number] => {
        const { executeSignedTransactionBlock } = useSui();
        const { signTransactionBlock } = useWalletKit();
        const [isLoading, setIsLoading] = useState(false);
        const tx = new TransactionBlock();
        

        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::dashboard::create_dashboard`,
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
          console.log("useReviewAddNew, signing transaction block...");
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
                  console.log(resp);
                  if (resp.effects?.status.status === "success") {
                    console.log("Review newly created");
                    toast.success("Review newly created.");
                    return [undefined, 0] 
                  } else {
                    console.log("Review creation failed");
                    toast.error("Review creation failed.");
                    return [undefined, 0]
                  }
                })
                .catch((err) => {
                  setIsLoading(false);
                  console.log("Review creation failed");
                  console.log(err);
                  toast.error("Something went wrong, Review could not be created.");
                  return [undefined, 0]
                });
            })
            .catch(() => {
              setIsLoading(false);
              console.log("Error while signing tx");
              return [undefined, 0]
            });

};