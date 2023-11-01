import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";
import { useState } from "react";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Review } from "../types/Review";
import crypto from "crypto";

export const useReviewSubmit = () => {

    const handleSubmitReview = async(rev: Review) => {
        // Start to hash
        const reviewJson = JSON.stringify(rev);
        console.log("reviewJson = " + reviewJson);
        const firstHash = crypto.createHash("sha256");
        firstHash.update(reviewJson);
        const firstReviewHash = firstHash.digest();
        const secondHash = crypto.createHash("sha256");
        secondHash.update(firstReviewHash);
        secondHash.update(firstReviewHash.length.toString());
        const kvStoreKey = secondHash.digest("hex");
        const kvStoreObject = { [kvStoreKey]: reviewJson };


        console.log("submitting review...", rev);
        return await fetch("/api/review/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(kvStoreObject),
            })
            .then((res) => res.json())
            .then((result: Result) => {
                if (result) {
                    console.log("Review submitted successfully");
                    toast.success("Review submitted successfully");
                    return result;
                } else {
                    console.log("Review submission failed");
                    toast.error("Review submission failed");
                    return result;
                }
            })
    }

    return { handleSubmitReview };

}