import React, { useEffect, useState } from "react";
import { useSui } from "../hooks/useSui";
import { SuiMoveObject } from "@mysten/sui.js";
import { useAuthentication } from "../hooks/useAuthentication";
import { useRouter } from "next/navigation";
import { Service as ServiceType } from "../types/Service";

interface ServicesProps {
  onAdd: () => void;
}

export const Services = ({ onAdd }: ServicesProps) => {
  const { suiClient } = useSui();
  const { user } = useAuthentication();
  const router = useRouter();

  const [services, setServices] = useState([] as ServiceType[]);

  const onDisplayService = (service: ServiceType) => {
    router.push(`/service/${service.id}`);
  };

  useEffect(() => {
    async function getServies() {
      const dashboardResp = await suiClient.getObject({
        id: `${process.env.NEXT_PUBLIC_DASHBOARD_ID}`,
        options: { showContent: true },
      });
      console.log(`dashboardResp: ${JSON.stringify(dashboardResp.data)}`);

      const serviceList = (dashboardResp.data?.content as SuiMoveObject).fields
        .set.fields.contents;
      console.log(`serviceList: ${JSON.stringify(serviceList)}`);

      const servicesPromises = serviceList.map(async (serviceId: string) => {
        const obj = await suiClient.getObject({
          id: serviceId,
          options: { showContent: true },
        });
        const serviceName = (obj.data?.content as SuiMoveObject).fields.name;
        console.log(`obj: ${JSON.stringify(obj.data)}`);
        const service = { id: serviceId, name: serviceName };
        return service;
      });
      setServices(await Promise.all(servicesPromises));

      return dashboardResp.data;
    }

    getServies();
  }, [onAdd]);

  return (
    <div className="container">
      {services.length > 0 && (
        <table className="table-style">
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  {
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => onDisplayService(item)}
                    >
                      More info
                    </button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
