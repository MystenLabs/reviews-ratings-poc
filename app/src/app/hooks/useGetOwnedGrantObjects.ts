import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";

export const useGetOwnedGrantObjects = () => {
    const { currentAccount } = useWalletKit();
    const { suiClient } = useSui();

    const [dataGrants, setDataGrants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!!currentAccount?.address) {
            reFetchData();
        } else {
            setDataGrants([]);
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
                    StructType: `${process.env.NEXT_PUBLIC_PACKAGE}::review::ReviewAccessGrant`,
                },
                options: {
                    showContent: true,
                },
            })
            .then((res) => {
                console.log(res);
                setDataGrants(res.data);
                setIsLoading(false);
                setIsError(false);
            })
            .catch((err) => {
                console.log(err);
                setDataGrants([]);
                setIsLoading(false);
                setIsError(true);
            });
    };

    return {
        dataGrants: dataGrants.map(({ data }) => data.content.fields),
        isLoading,
        isError,
        reFetchData,
        currentAccount,
    };
};
