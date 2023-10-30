import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetReviews = (serviceId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setData([]);
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
        setData((res.data?.content as SuiMoveObject).fields
        .reviews.fields.contents);
        setIsLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        console.log(err);
        setData([]);
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    data: data.map(({ data }) => data),
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};
