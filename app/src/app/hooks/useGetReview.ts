import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";
import { Review } from "../types/Review";

export const useGetReview = (reviewId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [dataReview, setDataReview] = useState<Review>();
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
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};