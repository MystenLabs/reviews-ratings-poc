import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useServiceWriteReview = () => {
    const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();
    const HandleWriteReview = async(
        adminCap: string,
        serviceObj: string, 
        serviceOwnerAddress: string, 
        reviewHash: Uint8Array,
        setIsLoading: any) => {
            const tx = new TransactionBlock();
            tx.moveCall({
                target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::service::write_new_review`,
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
            return handleSignAndExecuteTransaction(tx, "Write New Review", setIsLoading);
        }

    const HandleWriteReviewWithoutPoE = async(       
        serviceObj: string | undefined, 
        serviceOwnerAddress: string, 
        reviewHash: String[],
        reviewLength: number,
        setIsLoading: any
    ) => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${process.env.NEXT_PUBLIC_PACKAGE_ADDRESS}::service::write_new_review_without_poe`,
            arguments: [
                tx.object(serviceObj ?? ""),
                tx.pure(serviceOwnerAddress),
                tx.pure(reviewHash),
                tx.pure(reviewLength),
                tx.pure("0x0000000000000000000000000000000000000000000000000000000000000006"),
            ],
        });
        setIsLoading(true);
        console.log("write new Review, signing transaction block...");
        return handleSignAndExecuteTransaction(tx, "Write New Review without PoE", setIsLoading);
    }

    return { HandleWriteReview, HandleWriteReviewWithoutPoE }
};