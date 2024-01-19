"use client";

import React, { useState } from "react";
import { useGetOwnedDelisted } from "@/app/hooks/useGetOwnedDelisted";
import { useServiceReview } from "@/app/hooks/useServiceReview";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { HiXCircle } from "react-icons/hi";

const DelistedPage = () => {
  const { dataDelisted } = useGetOwnedDelisted();
  const { handleDeleteReview } = useServiceReview();

  const [delistedId, setDelistedId] = useState("");
  const [reviewId, setReviewId] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const onDelete = async () => {
    await handleDeleteReview(delistedId, reviewId);
    window.location.reload();
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Delisted Reviews</h1>
      <p className="my-4 text-lg text-gray-500">
        Following reviews are no longer listed and can be deleted
      </p>
      <div>
        {dataDelisted.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataDelisted.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id.id}
                >
                  <Table.Cell>
                    <div className="overflow-hidden truncate">
                      {item.review_id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {
                      <Button
                        color="red"
                        pill
                        onClick={() => {
                          setDelistedId(item.id.id);
                          setReviewId(item.review_id);
                          setOpenModal(true);
                        }}
                      >
                        Delete
                        <HiXCircle className="ml-2 h-5 w-5" />
                      </Button>
                    }
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Delete a review from service</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label>Delisted Id</Label>
                </div>
                <TextInput id="delistedId" value={delistedId} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label>Review Id</Label>
                </div>
                <TextInput id="reviewId" value={reviewId} disabled />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setOpenModal(false);
                onDelete();
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

export default DelistedPage;
