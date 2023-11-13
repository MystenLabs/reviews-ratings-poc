"use client";
import { useParams } from "next/navigation";
import { useGetReviews } from "../../hooks/useGetReviews";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AddReview } from "@/app/components/review/AddReview";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import crypto from "crypto";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button, Rating } from "flowbite-react";

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

export default function Service() {
  const router = useRouter();
  const { id } = useParams();
  const { dataReviews, dataName, dataStars, isLoading, currentAccount } =
    useGetReviews(id);

  const [reviews, setReviews] = useState([] as ReviewType[]);

  const [openModal, setOpenModal] = useState(false);
  const [reviewBody, setReviewBody] = useState("");
  const [overallRate, setOverallRate] = useState("3");
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

  const createReview = async (): Promise<void> => {
    const tx = new TransactionBlock();

    console.log(`serviceId=${id}`);
    console.log(`review_body=${reviewBody}`);
    console.log(`review_len=${reviewBody.length}`);

    const firstHash = crypto.createHash("sha256");
    firstHash.update(reviewBody);
    const firstReviewHash = firstHash.digest();
    const secondHash = crypto.createHash("sha256");
    secondHash.update(firstReviewHash);
    secondHash.update(reviewBody.length.toString());
    const kvStoreKey = secondHash.digest("hex");

    let reviewAdded = false;
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        body: JSON.stringify({ key: kvStoreKey, value: reviewBody }),
      });
      const res = await response.json();
      console.log("Create review response: ", res);
      if (res.success) {
        reviewAdded = true;
      } else {
        console.error(res.error);
      }
    } catch (error) {
      console.error(error);
    }
    console.log(`review_hash=${kvStoreKey}`);

    if (!reviewAdded) {
      return;
    }

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review_without_poe`,
      arguments: [
        tx.object(id),
        tx.pure(currentAccount?.address),
        tx.pure(kvStoreKey),
        tx.pure(reviewBody.length),
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
      <h1>Service</h1>
      <div>Name: {`${dataName}`}</div>
      <div>Id: {`${id}`}</div>
      <div>Reviews: {`${reviews.length}`}</div>
      <div>
        Rating:
        <Rating>
          <Rating.Star />
          <Rating.Star />
          <Rating.Star />
          <Rating.Star />
          <Rating.Star filled={false} />
          <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {`${dataStars.toFixed(2)}`} out of 5
          </p>
        </Rating>
      </div>
      <div>
        {reviews.length > 0 && (
          <table className="table-style">
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.priority}</td>
                  <td>
                    {
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => onDisplayReview(item)}
                      >
                        More info
                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Button onClick={() => setOpenModal(true)}>Add a new review</Button>
      <AddReview
        serviceId={id}
        reviewBody={reviewBody}
        setReviewBody={setReviewBody}
        overallRate={overallRate}
        setOverallRate={setOverallRate}
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSubmitReview={createReview}
      />
    </div>
  );
}
