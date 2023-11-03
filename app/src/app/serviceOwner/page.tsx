"use client";

import React, { ChangeEvent, useState, useCallback } from "react";
import { Services } from "../components/Services";
import { useWalletKit } from "@mysten/wallet-kit";
import { SuiMoveObject } from "@mysten/sui.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useServiceCreation } from "../hooks/useServiceCreation";
import { useDashboardRegisterService } from "../hooks/useDashboardRegisterService";
import { useSignAndExecuteTransaction } from "../hooks/useSignAndExecuteTransaction";

const ServiceOwnerPage = () => {
  const { handleServiceCreationAndRegister } = useServiceCreation();
  const [serviceName, setServiceName] = useState("");
  const handleServiceNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setServiceName(event.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const dashbardObj = process.env.NEXT_PUBLIC_DASHBOARD_ID as string;

  const onServiceAdded = useCallback(() => {}, []);

  const create_service = async (): Promise<void> => {
    console.log(`serviceName: ${serviceName}`);

    const resp = await handleServiceCreationAndRegister(
      serviceName, 
      dashbardObj,
      setIsLoading
      ).then((resp) => {
        console.log(`resp: ${JSON.stringify(resp)}`);
        setTimeout(() => {
          window.location.reload(),
          2000
        });
        onServiceAdded();
      });
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
