import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";
import { Review } from "../types/Review";

export const useGetReview = (reviewId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [dataReview, setDataReview] = useState<Review>();
  const [dataReviewBody, setDataReviewBody] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setDataReview(undefined);
      setIsLoading(false);
      setIsError(false);
    }
  }, [currentAccount]);

  const reFetchData = async () => {
    setIsLoading(true);

    console.log(`fetching obj_id=${reviewId}`);

    suiClient
      .getObject({
        id: reviewId,
        options: {
          showContent: true,
        },
      })
      .then(async (res) => {
        // console.log(res);
        setDataReview((res.data?.content as SuiMoveObject).fields as Review);
        // console.log(`hash_of_review=${dataReview?.hash}`);
        const reviewHash = (res.data?.content as SuiMoveObject).fields.hash;
        if (reviewHash.length > 0) {
          await fetch(`/api/review/${reviewHash}`, {
            method: "GET",
          })
            .then((body) => body.json())
            .then((body) => {
              // console.log(`review_body=${body}`);
              setDataReviewBody(body);
            });
        } else {
          return;
        }
        setIsLoading(false);
        setIsError(false);
        // console.log("review = " + JSON.stringify(dataReview));
      })
      .catch((err) => {
        console.log(err);
        setDataReview(undefined);
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    dataReview,
    dataReviewBody,
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};