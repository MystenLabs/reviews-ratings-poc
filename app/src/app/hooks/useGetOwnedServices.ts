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
    const servicesPromises = serviceList.map(async (serviceId: string) => {
      const obj = await suiClient.getObject({
        id: serviceId,
        options: { showContent: true },
      });
      const name = (obj.data?.content as SuiMoveObject).fields.name;
      const stars = (obj.data?.content as SuiMoveObject).fields.overall_rate;
      const reward = (obj.data?.content as SuiMoveObject).fields.reward;
      const pool = (obj.data?.content as SuiMoveObject).fields.reward_pool;
      console.log(`obj: ${JSON.stringify(obj.data)}`);
      return { id: serviceId, name, stars, reward, pool };
    });
    Promise.all(servicesPromises).then((data) => setServices(data));
  }, [currentAccount, servicesIsLoading]);

  return {
    dataServices: services,
  };
};
