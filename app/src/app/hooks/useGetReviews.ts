import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetReviews = (serviceId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [dataReviews, setDataReviews] = useState<any[]>([]);
  const [dataName, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setDataReviews([]);
      setName("");
      setIsLoading(false);
      setIsError(false);
    }
  }, [currentAccount]);

  const reFetchData = async () => {
    setIsLoading(true);

    console.log(`fetching obj_id=${serviceId}`);

    suiClient
      .getObject({
        id: serviceId,
        options: {
          showContent: true,
        },
      })
      .then((res) => {
        console.log(res);
        setDataReviews((res.data?.content as SuiMoveObject).fields.reviews.fields.contents);
        setName((res.data?.content as SuiMoveObject).fields.name);
        setIsLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        console.log(err);
        setDataReviews([]);
        setName("");
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    dataReviews,
    dataName,
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};
