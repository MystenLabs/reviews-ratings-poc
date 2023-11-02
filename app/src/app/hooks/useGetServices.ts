import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetServices = (dashboardId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [serviceList, setServiceList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setServiceList([]);
      setIsLoading(false);
      setIsError(false);
    }
  }, [currentAccount]);

  const reFetchData = async () => {
    setIsLoading(true);

    console.log(`fetching obj_id=${dashboardId}`);
    console.log("calling Get Services");
    suiClient
      .getObject({
        id: dashboardId,
        options: {
          showContent: true,
        },
      })
      .then((res) => {
        console.log(`res: ${JSON.stringify(res.data)}`);
        setServiceList((res.data?.content as SuiMoveObject).fields.set.fields.contents);
        setIsLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        console.log(err);
        setServiceList([]);
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    serviceList,
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};
