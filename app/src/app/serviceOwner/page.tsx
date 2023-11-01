"use client";

import React, { ChangeEvent, useState, useCallback } from "react";
import { Services } from "../components/Services";
import { useWalletKit } from "@mysten/wallet-kit";
import { SuiMoveObject } from "@mysten/sui.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const ServiceOwnerPage = () => {
  const { signAndExecuteTransactionBlock } = useWalletKit();
  const [serviceName, setServiceName] = useState("");
  const handleServiceNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceName(event.target.value);
  };

  const onServiceAdded = useCallback(() => {}, []);

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
    console.dir(resp, { depth: null });

    onServiceAdded();
  };

  return (
    <div>
      <h1>Services</h1>
      <Services />
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
