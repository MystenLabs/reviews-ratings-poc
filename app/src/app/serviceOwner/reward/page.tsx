"use client";

import React, { useState } from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { useGetOwnedAdminCaps } from "@/app/hooks/useGetOwnedAdminCaps";
import { Alert, Button, Modal, Label, TextInput, Table } from "flowbite-react";
import { HiCake } from "react-icons/hi";
import { useServiceReward } from "@/app/hooks/useServiceRewardDistribution";

const RewardPage = () => {
  const { dataServices } = useGetOwnedServices();
  const { dataAdminCaps } = useGetOwnedAdminCaps();
  const { handleServiceReward } = useServiceReward();

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const onReward = () => {
    const adminCap = dataAdminCaps.find((item) => item.service_id == serviceId);
    if (adminCap === undefined) {
      setAlertMsg(`AdminCap not found for ${serviceId}`);
      return;
    }
    console.log("adminCaps=" + JSON.stringify(dataAdminCaps));
    handleServiceReward(adminCap.id.id, serviceId);
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      {alertMsg.length > 0 && (
        <Alert color="failure">
          <span className="font-medium">Failed to Reward!</span>
          {`  ${alertMsg}`}
        </Alert>
      )}
      <h1>Reward</h1>
      <p className="my-4 text-lg text-gray-500">Reward top 10 reviewers.</p>

      <div className="container">
        {dataServices.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Reward</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataServices.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id}
                >
                  <Table.Cell>
                    <div className="w-40">{item.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="overflow-hidden truncate w-48">
                      {item.id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{item.reward}</Table.Cell>
                  <Table.Cell>
                    {
                      <Button
                        color="gray"
                        pill
                        onClick={() => {
                          setServiceId(item.id);
                          setOpenModal(true);
                        }}
                      >
                        Reward
                        <HiCake className="ml-2 h-5 w-5" />
                      </Button>
                    }
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Top up a reward pool</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label>Service Id</Label>
                </div>
                <TextInput id="serviceId" value={serviceId} disabled />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setOpenModal(false);
                onReward();
              }}
            >
              Confirm
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Decline
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RewardPage;
