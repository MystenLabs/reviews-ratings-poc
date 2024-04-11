import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";

export const useGetOwnedModerator = () => {
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
    suiClient
      .getOwnedObjects({
        owner: currentAccount?.address!,
        filter: {
          StructType: `${process.env.NEXT_PUBLIC_PACKAGE}::moderator::Moderator`,
        },
        options: {
          showContent: true,
        },
      })
      .then((res) => {
        console.log("Moderators=" + JSON.stringify(res));
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
    dataModerators: data.map(({ data }) => data.content.fields.id.id),
  };
};
