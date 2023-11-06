"use client";

import React, { useState } from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { useServicePoEGeneration } from "@/app/hooks/useServicePoeGeneration";
import { useGetOwnedAdminCaps } from "@/app/hooks/useGetOwnedAdminCaps";
import { Alert, Button, Modal, Label, TextInput } from "flowbite-react";

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
      <h1>Services</h1>
      <div className="container">
        {dataServices.length > 0 && (
          <table className="table-style">
            <thead>
              <tr>
                <th>Service ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataServices.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    {
                      <Button
                        onClick={() => {
                          setServiceId(item.id);
                          setOpenModal(true);
                        }}
                      >
                        Generate POE
                      </Button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Generate a Proof of Experience</Modal.Header>
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
