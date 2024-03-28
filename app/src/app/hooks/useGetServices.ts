import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";

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
      .getDynamicFields({
        parentId: dashboardId,
        cursor: null,
        limit: 100,
      })
      .then((res) => {
        console.log(`res: ${JSON.stringify(res.data)}`);
        setServiceList(res.data.map((item) => item.name.value as string));
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
