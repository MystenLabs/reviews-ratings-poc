"use client";
import { useParams } from "next/navigation";
import { useGetModerators } from "@/app/hooks/useGetModerators";
import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { HiOutlinePlusCircle, HiXCircle } from "react-icons/hi";
import { useGetOwnedAdminCaps } from "@/app/hooks/useGetOwnedAdminCaps";
import { useServiceModerator } from "@/app/hooks/useServiceModerator";

export default function ModeratorEdit() {
  const { id, name } = useParams();
  const { dataModerators, isLoading, currentAccount } = useGetModerators(id);
  const { dataAdminCaps } = useGetOwnedAdminCaps();
  const { handleAddModerator, handleRemoveModerator } = useServiceModerator();

  const [moderators, setModerators] = useState([] as string[]);

  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [moderatorAddress, setModeratorAddress] = useState("");

  const onDelete = async () => {
    const adminCap = dataAdminCaps.find((item) => item.service_id == id);
    if (adminCap === undefined) {
      return;
    }
    await handleRemoveModerator(adminCap.id.id, id, moderatorAddress);
    window.location.reload();
  };

  const onAddModerator = async () => {
    const adminCap = dataAdminCaps.find((item) => item.service_id == id);
    if (adminCap === undefined) {
      return;
    }
    if (moderatorAddress.length === 0) {
      return;
    }
    console.log("adminCaps=" + JSON.stringify(dataAdminCaps));
    await handleAddModerator(adminCap.id.id, id, moderatorAddress);
    window.location.reload();
  };

  useEffect(() => {
    async function getModerators() {
      if (isLoading) {
        return;
      }
      const moderatorsPromises = dataModerators.map(async (item: string) => {
        return item;
      });
      setModerators(await Promise.all(moderatorsPromises));
    }

    getModerators();
  }, [currentAccount, isLoading, dataModerators]);

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Moderators</h1>
      <div>Name: {`${decodeURIComponent(name)}`}</div>
      <div>Id: {`${id}`}</div>
      <div className="container">
        {moderators.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Address</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {moderators.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item}
                >
                  <Table.Cell>
                    <div className="overflow-hidden">{item}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      color="red"
                      pill
                      onClick={() => {
                        setModeratorAddress(item);
                        setOpenModalRemove(true);
                      }}
                    >
                      Delete
                      <HiXCircle className="ml-2 h-5 w-5" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      <Button
        color="green"
        pill
        onClick={() => {
          setOpenModalAdd(true);
        }}
      >
        Add
        <HiOutlinePlusCircle className="ml-2 h-5 w-5" />
      </Button>

      <Modal show={openModalAdd} onClose={() => setOpenModalAdd(false)}>
        <Modal.Header>Add a new moderator</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label>Service Id</Label>
              </div>
              <TextInput id="serviceId" value={id} disabled />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="moderatorAddress" value="Moderator Address" />
              </div>
              <TextInput
                id="moderatorAddress"
                placeholder=""
                value={moderatorAddress}
                onChange={(event) => setModeratorAddress(event.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setOpenModalAdd(false);
              onAddModerator();
            }}
          >
            Confirm
          </Button>
          <Button color="gray" onClick={() => setOpenModalAdd(false)}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={openModalRemove} onClose={() => setOpenModalRemove(false)}>
        <Modal.Header>Delete a moderator from service</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label>Service Id</Label>
              </div>
              <TextInput id="serviceId" value={id} disabled />
            </div>
            <div>
              <div className="mb-2 block">
                <Label>Moderator Address</Label>
              </div>
              <TextInput
                id="moderatorAddress"
                value={moderatorAddress}
                disabled
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setOpenModalRemove(false);
              onDelete();
            }}
          >
            Confirm
          </Button>
          <Button color="gray" onClick={() => setOpenModalRemove(false)}>
            Decline
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
