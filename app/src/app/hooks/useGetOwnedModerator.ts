import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetOwnedModerator = () => {
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
                    StructType: `${process.env.NEXT_PUBLIC_PACKAGE}::service::Moderator`,
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
        dataModerators: data.map(({ data }) => data.content.fields),
    };
};
