"use client";
import { useParams } from "next/navigation";
import { useGetReviews } from "@/app/hooks/useGetReviews";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AddReview } from "@/app/components/review/AddReview";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button, Table } from "flowbite-react";
import { HiOutlineArrowRight, HiOutlinePencilAlt } from "react-icons/hi";
import { SuiMoveObject } from "@mysten/sui.js";
import { Review } from "@/app/types/Review";
import { useSui } from "@/app/hooks/useSui";
import { useAuthentication } from "@/app/hooks/useAuthentication";

interface ReviewType {
  id: string;
  priority: string;
}

export default function Service() {
  const router = useRouter();
  const { user } = useAuthentication();
  const { id } = useParams();
  const { suiClient } = useSui();
  const { dataReviews, dataName, dataStars, isLoading, currentAccount } =
    useGetReviews(id);

  const [reviews, setReviews] = useState([] as ReviewType[]);

  const [openModal, setOpenModal] = useState(false);
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const SUI_CLOCK =
    "0x0000000000000000000000000000000000000000000000000000000000000006";

  const onDisplayReview = (review: ReviewType) => {
    router.push(`/review/${review.id}`);
  };

  useEffect(() => {
    async function getReviews() {
      if (isLoading) {
        return;
      }
      console.dir(
        `reviews: ${JSON.stringify(dataReviews)} size=${dataReviews.length}`,
      );

      const reviewsPromises = dataReviews.map(async (item: string) => {
        console.log(`review: ${JSON.stringify(item)}`);
        let total_score = "0";
        await suiClient
          .getObject({
            id: item,
            options: {
              showContent: true,
            },
          })
          .then(async (res) => {
            total_score = (
              (res.data?.content as SuiMoveObject).fields as Review
            ).total_score.toString();
          });
        return { id: item, priority: total_score };
      });
      setReviews(await Promise.all(reviewsPromises));
      console.dir(`reviews_post: ${JSON.stringify(reviews)}`);
    }

    getReviews();
  }, [currentAccount, isLoading, dataReviews]);

  const createReview = async (
    reviewBody: string,
    overallRate: string,
  ): Promise<void> => {
    const tx = new TransactionBlock();

    // console.log(`serviceId=${id}`);
    // console.log(`review_body=${reviewBody}`);
    // console.log(`review_len=${reviewBody.length}`);

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review_without_poe`,
      arguments: [
        tx.object(id),
        tx.pure(currentAccount?.address),
        tx.pure(reviewBody),
        tx.pure(overallRate),
        tx.object(SUI_CLOCK),
      ],
    });

    tx.setGasBudget(1000000000);
    const resp = await signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    console.dir(resp, { depth: null });

    window.location.reload();
    // router.push(`/service/${id}`);
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Top Reviews</h1>
      <div>Name: {`${dataName}`}</div>
      <div>Id: {`${id}`}</div>
      <div>Total: {`${reviews.length}`}</div>
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
                    {
                      <Button
                        color="gray"
                        pill
                        onClick={() => onDisplayReview(item)}
                      >
                        Info
                        <HiOutlineArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    }
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {user?.role !== "serviceOwner" && (
        <Button color="green" pill onClick={() => setOpenModal(true)}>
          Add a new review
          <HiOutlinePencilAlt className="ml-2 h-5 w-5" />
        </Button>
      )}
      <AddReview
        serviceId={id}
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSubmitReview={createReview}
      />
    </div>
  );
}
