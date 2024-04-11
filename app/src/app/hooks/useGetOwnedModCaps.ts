import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";

export const useGetOwnedModCaps = () => {
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
        suiClient
            .getOwnedObjects({
                owner: currentAccount?.address!,
                filter: {
                    StructType: `${process.env.NEXT_PUBLIC_PACKAGE}::moderator::ModCap`,
                },
                options: {
                    showContent: true,
                },
            })
            .then((res) => {
                console.log(res);
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
        dataCaps: data.map(({ data }) => data.content.fields),
        isLoading,
    };
};
