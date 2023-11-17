import { useWalletKit } from "@mysten/wallet-kit";
import { useEffect, useState } from "react";
import { useSui } from "./useSui";
import { Service as ServiceType } from "@/app/types/Service";
import { SuiMoveObject } from "@mysten/sui.js";
import { useGetOwnedAdminCaps } from "@/app/hooks/useGetOwnedAdminCaps";

export const useGetOwnedServices = () => {
  const { currentAccount } = useWalletKit();
  const { suiClient } = useSui();

  const { dataAdminCaps, isLoading } = useGetOwnedAdminCaps();
  const [services, setServices] = useState([] as ServiceType[]);

  useEffect(() => {
    if (isLoading) return;
    const servicesPromises = dataAdminCaps.map(async (item) => {
      const obj = await suiClient.getObject({
        id: item.service_id,
        options: { showContent: true },
      });
      const name = (obj.data?.content as SuiMoveObject).fields.name;
      const stars = (obj.data?.content as SuiMoveObject).fields.overall_rate;
      const reward = (obj.data?.content as SuiMoveObject).fields.reward;
      const pool = (obj.data?.content as SuiMoveObject).fields.reward_pool;
      console.log(`obj: ${JSON.stringify(obj.data)}`);
      return { id: item.service_id, name, stars, reward, pool };
    });
    Promise.all(servicesPromises).then((data) => setServices(data));
  }, [currentAccount, isLoading]);

  return {
    dataServices: services,
  };
};
