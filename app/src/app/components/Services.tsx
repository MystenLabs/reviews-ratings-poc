import React, { useEffect, useState } from "react";
import { useSui } from "../hooks/useSui";
import { SuiMoveObject } from "@mysten/sui.js";

interface ServicesProps {
  onAdd: () => void;
}

export const Services = ({ onAdd }: ServicesProps) => {
  const { suiClient } = useSui();

  const [services, setServices] = useState(
    [] as {
      id: string;
      name: string;
    }[]
  );

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
  }, [suiClient, onAdd]);

  return (
    <div className="container">
      {services.length > 0 && (
        <table className="table-style">
          <thead>
            <tr>
              <th>Service ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {services.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
