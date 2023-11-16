"use client";

import React, { useState } from "react";
import { useGetOwnedServices } from "@/app/hooks/useGetOwnedServices";
import { useServiceTopUp } from "@/app/hooks/useServiceTopUp";
import { Alert, Button, Modal, Label, TextInput, Table } from "flowbite-react";
import { HiCurrencyDollar } from "react-icons/hi";

const TopUpPage = () => {
  const { dataServices } = useGetOwnedServices();
  const { handleServiceTopUp } = useServiceTopUp();

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [amount, setAmount] = useState(0);
  const [alertMsg, setAlertMsg] = useState("");

  const onTopUp = async () => {
    if (amount < 100) {
      setAlertMsg(`Enter a valid amount`);
      return;
    }
    await handleServiceTopUp(serviceId, amount);
    window.location.reload();
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      {alertMsg.length > 0 && (
        <Alert color="failure">
          <span className="font-medium">Failed to Top Up!</span>
          {`  ${alertMsg}`}
        </Alert>
      )}
      <h1>Top Up</h1>
      <p className="my-4 text-lg text-gray-500">Top up reward pools.</p>

      <div className="container">
        {dataServices.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Balance</Table.HeadCell>
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
                  <Table.Cell>{item.pool?.toLocaleString("en-US")}</Table.Cell>
                  <Table.Cell>
                    <div className="w-32">
                      {
                        <Button
                          color="gray"
                          pill
                          onClick={() => {
                            setServiceId(item.id);
                            setOpenModal(true);
                          }}
                        >
                          Top Up
                          <HiCurrencyDollar className="ml-2 h-5 w-5" />
                        </Button>
                      }
                    </div>
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
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="amount" value="Amount" />
                </div>
                <TextInput
                  id="amount"
                  placeholder=""
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setOpenModal(false);
                onTopUp();
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

export default TopUpPage;
