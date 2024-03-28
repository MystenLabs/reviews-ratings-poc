import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetModerators = (serviceId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [dataModerators, setDataModerators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setDataModerators([]);
      setIsLoading(false);
      setIsError(false);
    }
  }, [currentAccount]);

  const reFetchData = async () => {
    setIsLoading(true);

    console.log(`fetching obj_id=${serviceId}`);
    console.log("calling Get reviews");
    suiClient
      .getObject({ id: serviceId, options: { showContent: true } })
      .then((res) => {
        suiClient
          .getDynamicFields({
            parentId: (res.data?.content as SuiMoveObject).fields.moderators.fields.id.id,
            cursor: null,
            limit: 100,
          })
          .then((res) => {
            console.log(res);
            setDataModerators(
              res.data.map((item) => item.name.value as string),
            );
            setIsLoading(false);
            setIsError(false);
          });
      })
      .catch((err) => {
        console.log(err);
        setDataModerators([]);
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    dataModerators,
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};
