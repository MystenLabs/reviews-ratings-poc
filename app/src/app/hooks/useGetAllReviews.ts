import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetAllReviews = (serviceId: string) => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const [dataReviews, setDataReviews] = useState<any[]>([]);
  const [dataName, setDataName] = useState<string>("");
  const [dataStars, setDataStars] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!!currentAccount?.address) {
      reFetchData();
    } else {
      setDataReviews([]);
      setDataName("");
      setIsLoading(false);
      setIsError(false);
    }
  }, [currentAccount]);

  const reFetchData = async () => {
    setIsLoading(true);

    console.log(`fetching obj_id=${serviceId}`);
    console.log("calling Get reviews");
    suiClient
      .getObject({
        id: serviceId,
        options: {
          showContent: true,
        },
      })
      .then(async (res) => {
        setDataName((res.data?.content as SuiMoveObject).fields.name);
        const len = (res.data?.content as SuiMoveObject).fields.reviews.fields
          .size;
        if (len > 0) {
          setDataStars(
            (res.data?.content as SuiMoveObject).fields.overall_rate / len,
          );
        }
        let reviews: string[][] = Array(len);
        let i = 0;
        let { nextCursor, hasNextPage, data } =
          await suiClient.getDynamicFields({
            parentId: (res.data?.content as SuiMoveObject).fields.reviews.fields
              .id.id,
            cursor: null,
          });
        data.forEach((item) => {
          reviews[i++] = item.name.value as string[];
        });
        while (hasNextPage) {
          const resp = await suiClient.getDynamicFields({
            parentId: (res.data?.content as SuiMoveObject).fields.reviews.fields
              .id.id,
            ...(hasNextPage && { cursor: nextCursor }),
          });
          hasNextPage = resp.hasNextPage;
          nextCursor = resp.nextCursor;
          data = resp.data;
          data.forEach((item) => {
            reviews[i++] = item.name.value as string[];
          });
        }
        setDataReviews(reviews);
        setIsLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        console.log(err);
        setDataReviews([]);
        setDataName("");
        setDataStars(0);
        setIsLoading(false);
        setIsError(true);
      });
  };

  return {
    dataReviews,
    dataName,
    dataStars,
    isLoading,
    isError,
    reFetchData,
    currentAccount,
  };
};
