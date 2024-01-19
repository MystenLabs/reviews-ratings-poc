import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";

export const useGetOwnedDelisted = () => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    reFetchData();
  }, [currentAccount]);

  const reFetchData = async () => {
    suiClient
      .getOwnedObjects({
        owner: currentAccount?.address!,
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_PACKAGE}::service::Delisted`,
        },
        options: {
          showContent: true,
        },
      })
      .then((res) => {
        console.log("Delisted=" + JSON.stringify(res));
        setData(res.data);
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
    dataDelisted: data.map(({ data }) => data.content.fields),
  };
};
