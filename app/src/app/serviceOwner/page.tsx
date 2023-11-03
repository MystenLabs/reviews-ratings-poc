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
    <div className="flex flex-col mx-32 my-10">
      <h1>Services</h1>
      <Services />
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await create_service();
        }}
      >
        <div className="flex flex-row space-x-6">
          <label htmlFor="serviceName" className="self-center w-56">
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
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-80 rounded"
          >
            Add a new service
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceOwnerPage;
