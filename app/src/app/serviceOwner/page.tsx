"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { SuiClient } from "@mysten/sui.js/client";
import { useWalletKit } from "@mysten/wallet-kit";
import { SuiMoveObject } from "@mysten/sui.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const ServiceOwnerPage = () => {
  const client = new SuiClient({
    url: `${process.env.NEXT_PUBLIC_SUI_NETWORK}`,
  });

  const { currentAccount } = useWalletKit();
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const [services, setServices] = useState(
    [] as {
      id: string;
      name: string;
    }[]
  );
  const [serviceName, setServiceName] = useState("");
  const [reviewAdded, setReviewAdded] = useState(false);

  const handleServiceNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceName(event.target.value);
  };

  const create_service = async (): Promise<void> => {
    const tx = new TransactionBlock();

    let [service_id] = tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::create_service`,
      arguments: [tx.pure(serviceName)],
    });

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::dashboard::register_service`,
      arguments: [
        tx.object(`${process.env.NEXT_PUBLIC_DASHBOARD_ID}`),
        service_id,
      ],
    });

    tx.setGasBudget(1000000000);
    const resp = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    setReviewAdded(true);
    console.dir(resp, { depth: null });
    console.log(`create_service finished`);
  };

  useEffect(() => {
    if (currentAccount === null || currentAccount === undefined) {
      return;
    }
    if (reviewAdded) {
      setReviewAdded(false);
    }

    const address = currentAccount.address;

    async function getServies() {
      const dashboardResp = await client.getObject({
        id: `${process.env.NEXT_PUBLIC_DASHBOARD_ID}`,
        options: { showContent: true },
      });
      console.log(`dashboardResp: ${JSON.stringify(dashboardResp.data)}`);

      const serviceList = (dashboardResp.data?.content as SuiMoveObject).fields
        .set.fields.contents;
      console.log(`serviceList: ${JSON.stringify(serviceList)}`);

      const servicesPromises = serviceList.map(async (serviceId: string) => {
        const obj = await client.getObject({
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
  }, [currentAccount, reviewAdded]);

  return (
    <div className="container">
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
      <div className="form-container">
        <form
          className="service-form"
          onSubmit={async (event) => {
            event.preventDefault();
            await create_service();
          }}
        >
          <div className="form-group">
            <label htmlFor="serviceName" className="navbar-link">
              Service name
            </label>
            <input
              type="text"
              id="serviceName"
              className="navbar-input"
              placeholder="Service name"
              value={serviceName}
              onChange={handleServiceNameChange}
            />
            <button type="submit" className="navbar-link">
              Add a new service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceOwnerPage;
