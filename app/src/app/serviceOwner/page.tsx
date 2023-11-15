"use client";

import React, { ChangeEvent, useState, useCallback } from "react";
import { Services } from "../components/Services";
import { useWalletKit } from "@mysten/wallet-kit";
import { SuiMoveObject } from "@mysten/sui.js";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useServiceCreation } from "../hooks/useServiceCreation";
import { useDashboardRegisterService } from "../hooks/useDashboardRegisterService";
import { useSignAndExecuteTransaction } from "../hooks/useSignAndExecuteTransaction";
import { AddService } from "@/app/components/service/AddService";
import { Button } from "flowbite-react";
import { HiOutlinePlusCircle } from "react-icons/hi";

const ServiceOwnerPage = () => {
  const { handleServiceCreationAndRegister } = useServiceCreation();

  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const dashboardId = process.env.NEXT_PUBLIC_DASHBOARD_ID as string;

  const onServiceAdded = useCallback(() => {}, []);

  const createService = async (serviceName: string): Promise<void> => {
    console.log(`serviceName: ${serviceName}`);

    const resp = await handleServiceCreationAndRegister(
      serviceName,
      dashboardId,
      setIsLoading,
    ).then((resp) => {
      console.log(`resp: ${JSON.stringify(resp)}`);
      setTimeout(() => {
        window.location.reload(), 2000;
      });
      onServiceAdded();
    });
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Dashboard</h1>
      <Services />
      <Button color="green" pill onClick={() => setOpenModal(true)}>
        Add a new service
        <HiOutlinePlusCircle className="ml-2 h-5 w-5" />
      </Button>
      <AddService
        dashboardId={dashboardId}
        openModal={openModal}
        setOpenModal={setOpenModal}
        onCreateService={createService}
      />
    </div>
  );
};

export default ServiceOwnerPage;
