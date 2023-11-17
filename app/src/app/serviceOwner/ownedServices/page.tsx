"use client";

import React, { useState } from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { useServicePoEGeneration } from "@/app/hooks/useServicePoeGeneration";
import { useGetOwnedAdminCaps } from "@/app/hooks/useGetOwnedAdminCaps";
import { Alert, Button, Modal, Label, TextInput, Table } from "flowbite-react";
import { HiOutlinePlusCircle } from "react-icons/hi";

const OwnedServicesPage = () => {
  const { dataServices } = useGetOwnedServices();
  const { dataAdminCaps } = useGetOwnedAdminCaps();
  const { handleServicePoEGeneration } = useServicePoEGeneration();

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const onGeneratePOE = () => {
    const adminCap = dataAdminCaps.find((item) => item.service_id == serviceId);
    if (adminCap === undefined) {
      setAlertMsg(`AdminCap not found for ${serviceId}`);
      return;
    }
    if (recipient.length === 0) {
      setAlertMsg(`Enter a valid recipient address`);
      return;
    }
    console.log("adminCaps=" + JSON.stringify(dataAdminCaps));
    handleServicePoEGeneration(adminCap.id.id, serviceId, recipient);
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      {alertMsg.length > 0 && (
        <Alert color="failure">
          <span className="font-medium">Failed to generate POE!</span>
          {`  ${alertMsg}`}
        </Alert>
      )}
      <h1>Customer (Proof of Experience)</h1>
      <p className="my-4 text-lg text-gray-500">
        Generate an NFT for a customer after the customer pays for the service.
        The customer may burn the NFT later when writing a review for the
        service and receive a high score for the review.
      </p>

      <div className="container">
        {dataServices.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataServices.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id}
                >
                  <Table.Cell>{item.name}</Table.Cell>
                  <Table.Cell>
                    <div className="overflow-hidden truncate w-48">
                      {item.id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      className="w-32"
                      color="gray"
                      pill
                      onClick={() => {
                        setServiceId(item.id);
                        setOpenModal(true);
                      }}
                    >
                      Mint NFT
                      <HiOutlinePlusCircle className="ml-2 h-5 w-5" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Generate an NFT (Proof of Experience)</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label>Service Id</Label>
                </div>
                <TextInput id="serviceId" value={serviceId} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="recipient" value="Recipient Address" />
                </div>
                <TextInput
                  id="recipient"
                  placeholder=""
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setOpenModal(false);
                onGeneratePOE();
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

export default OwnedServicesPage;
