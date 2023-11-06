import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { useGetServices } from "@/app/hooks/useGetServices";
import { Service as ServiceType } from "@/app/types/Service";
import { SuiMoveObject } from "@mysten/sui.js";

export const useGetOwnedServices = () => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const { serviceList, isLoading: servicesIsLoading } = useGetServices(
    process.env.NEXT_PUBLIC_DASHBOARD_ID as string,
  );
  const [services, setServices] = useState([] as ServiceType[]);

  useEffect(() => {
    if (servicesIsLoading) return;
    reFetchData();
  }, [currentAccount, servicesIsLoading]);

  const reFetchData = async () => {
    const servicesPromises = serviceList.map(async (serviceId: string) => {
      const obj = await suiClient.getObject({
        id: serviceId,
        options: { showContent: true },
      });
      const serviceName = (obj.data?.content as SuiMoveObject).fields.name;
      console.log(`obj: ${JSON.stringify(obj.data)}`);
      return { id: serviceId, name: serviceName };
    });
    setServices(await Promise.all(servicesPromises));
  };

  return {
    dataServices: services,
  };
};
