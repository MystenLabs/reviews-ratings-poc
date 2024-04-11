"use client";

import React, {useEffect, useState} from "react";
import { useGetOwnedModCaps } from "@/app/hooks/useGetOwnedModCaps";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { HiOutlineArrowRight, HiOutlinePlusCircle } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useServiceModerator } from "@/app/hooks/useServiceModerator";

const ModeratorPage = () => {
  const router = useRouter();
  const { handleAddModerator, handleRemoveModerator } = useServiceModerator();
  const [modCap, setModCap] = useState("");
  const { dataCaps, isLoading } = useGetOwnedModCaps();

  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [moderatorAddress, setModeratorAddress] = useState("");

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (dataCaps.length > 0) {
      console.log("modCap=" + JSON.stringify(dataCaps));
      setModCap(dataCaps.at(0).id.id);
    }
  }, [isLoading]);


  const onAddModerator = async () => {
    if (modCap.length == 0) {
      return;
    }
    if (moderatorAddress.length === 0) {
      return;
    }
    await handleAddModerator(modCap, moderatorAddress);
    window.location.reload();
  };

  return (
      <div className="flex flex-col mx-32 my-10">
        <h1>Add a Moderator</h1>
        <p className="my-4 text-lg text-gray-500">
          Admin user can add a new moderator who may monitor all the reviews and remove
          them if they contain inappropriate contents.
        </p>
        <div className="container">
          <Button
              className="mb-4 w-64"
              color="green"
              pill
              onClick={() => {
                setOpenModalAdd(true);
              }}
          >
            Add
            <HiOutlinePlusCircle className="ml-2 h-5 w-5"/>
          </Button>

          <Modal show={openModalAdd} onClose={() => setOpenModalAdd(false)}>
            <Modal.Header>Add a new moderator</Modal.Header>
            <Modal.Body>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="moderatorAddress" value="Moderator Address"/>
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

          {/*<Modal show={openModalRemove} onClose={() => setOpenModalRemove(false)}>*/}
          {/*  <Modal.Header>Delete a moderator from service</Modal.Header>*/}
          {/*  <Modal.Body>*/}
          {/*    <div className="space-y-6">*/}
          {/*      <div>*/}
          {/*        <div className="mb-2 block">*/}
          {/*          <Label>Service Id</Label>*/}
          {/*        </div>*/}
          {/*        <TextInput id="serviceId" value={id} disabled />*/}
          {/*      </div>*/}
          {/*      <div>*/}
          {/*        <div className="mb-2 block">*/}
          {/*          <Label>Moderator Address</Label>*/}
          {/*        </div>*/}
          {/*        <TextInput*/}
          {/*            id="moderatorAddress"*/}
          {/*            value={moderatorAddress}*/}
          {/*            disabled*/}
          {/*        />*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </Modal.Body>*/}
          {/*  <Modal.Footer>*/}
          {/*    <Button*/}
          {/*        onClick={() => {*/}
          {/*          setOpenModalRemove(false);*/}
          {/*          onDelete();*/}
          {/*        }}*/}
          {/*    >*/}
          {/*      Confirm*/}
          {/*    </Button>*/}
          {/*    <Button color="gray" onClick={() => setOpenModalRemove(false)}>*/}
          {/*      Decline*/}
          {/*    </Button>*/}
          {/*  </Modal.Footer>*/}
          {/*</Modal>*/}
        </div>
      </div>
  );
};

export default ModeratorPage;
