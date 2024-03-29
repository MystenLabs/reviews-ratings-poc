"use client";
import { useParams } from "next/navigation";
import { useGetAllReviews } from "@/app/hooks/useGetAllReviews";
import { useServiceModerator } from "@/app/hooks/useServiceModerator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { HiOutlineArrowRight, HiXCircle } from "react-icons/hi";

export default function Reviews() {
  const router = useRouter();
  const { id, nft } = useParams();
  const { dataReviews, dataName, dataStars, isLoading, currentAccount } =
    useGetAllReviews(id);
  const { handleRemoveReview } = useServiceModerator();

  const [reviewId, setReviewId] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const onDisplayReview = (review_id: string) => {
    router.push(`/review/${review_id}`);
  };

  const onDelete = async () => {
    await handleRemoveReview(nft, id, reviewId);
    window.location.reload();
  };

  useEffect(() => {
    async function getReviews() {
      if (isLoading) {
        return;
      }
      console.dir(
        `reviews: ${JSON.stringify(dataReviews)} size=${dataReviews.length}`,
      );
    }

    getReviews();
  }, [currentAccount, isLoading, dataReviews]);

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Service</h1>
      <div>Name: {`${dataName}`}</div>
      <div>Id: {`${id}`}</div>
      <div>Reviews: {`${dataReviews.length}`}</div>
      <div className="container">
        {dataReviews.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Review ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataReviews.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item}
                >
                  <Table.Cell>
                    <div className="overflow-hidden">{item}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-row space-x-2">
                      <Button
                        color="gray"
                        pill
                        onClick={() => onDisplayReview(item)}
                      >
                        View
                        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button
                        color="red"
                        pill
                        onClick={() => {
                          setReviewId(item);
                          setOpenModal(true);
                        }}
                      >
                        Delete
                        <HiXCircle className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
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
                  <Label>Service Id</Label>
                </div>
                <TextInput id="serviceId" value={id} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label>Review Id</Label>
                </div>
                <TextInput id="reviewId" value={reviewId} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label>Moderator Id</Label>
                </div>
                <TextInput id="nft" value={nft} disabled />
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
}
