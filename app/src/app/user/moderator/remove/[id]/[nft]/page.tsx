"use client";
import { useParams } from "next/navigation";
import { useGetReviews } from "@/app/hooks/useGetReviews";
import { useServiceModerator } from "@/app/hooks/useServiceModerator";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { HiOutlineArrowRight, HiXCircle } from "react-icons/hi";

interface ReviewType {
  id: string;
  priority: string;
}

interface ReviewItem {
  type: string;
  fields: {
    key: string;
    priority: string;
  };
}

export default function Reviews() {
  const router = useRouter();
  const { id, nft } = useParams();
  const { dataReviews, dataName, dataStars, isLoading, currentAccount } =
    useGetReviews(id);
  const { handleRemoveReview } = useServiceModerator();

  const [reviews, setReviews] = useState([] as ReviewType[]);
  const [reviewId, setReviewId] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const onDisplayReview = (review: ReviewType) => {
    router.push(`/review/${review.id}`);
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

      const reviewsPromises = dataReviews.map(async (item: ReviewItem) => {
        console.log(`review: ${JSON.stringify(item)}`);
        console.log(` key > : ${item.fields.key}`);
        console.log(` priority > : ${item.fields.priority}`);
        //const review = { name: serviceName, priority: };
        return { id: item.fields.key, priority: item.fields.priority };
      });
      setReviews(await Promise.all(reviewsPromises));
      console.dir(`reviews_post: ${JSON.stringify(reviews)}`);
    }

    getReviews();
  }, [currentAccount, isLoading, dataReviews]);

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Service</h1>
      <div>Name: {`${dataName}`}</div>
      <div>Id: {`${id}`}</div>
      <div>Reviews: {`${reviews.length}`}</div>
      <div className="container">
        {reviews.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>Review ID</Table.HeadCell>
              <Table.HeadCell>Score</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {reviews.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id}
                >
                  <Table.Cell>
                    <div className="overflow-hidden">{item.id}</div>
                  </Table.Cell>
                  <Table.Cell>{item.priority}</Table.Cell>
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
                          setReviewId(item.id);
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
