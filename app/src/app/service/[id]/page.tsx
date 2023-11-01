"use client";

import { useParams } from "next/navigation";
import { useGetReviews } from "../../hooks/useGetReviews";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWalletKit } from "@mysten/wallet-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { signAndExecuteTransactionBlock } = useWalletKit();
  const router = useRouter();
  const { id } = useParams();
  const { dataReviews, dataName, isLoading, currentAccount } =
    useGetReviews(id);

  const [reviews, setReviews] = useState([] as ReviewType[]);

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
        `reviews: ${JSON.stringify(dataReviews)} size=${dataReviews.length}`
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

  const create_review = async (): Promise<void> => {
    const tx = new TransactionBlock();

    console.log(`serviceId=${id}`);

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review_without_poe`,
      arguments: [
        tx.object(id),
        tx.pure(currentAccount?.address),
        tx.pure(Array.from("1234"), "vector<u8>"),
        tx.pure(Math.floor(150 * Math.random())),
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
  };

  return (
    <div>
      <h1>Service</h1>
      <div>Name: {`${dataName}`}</div>
      <div>Id: {`${id}`}</div>
      <div>
        <div>Reviews: {`${reviews.length}`}</div>
        {reviews.length > 0 && (
          <table className="table-style">
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Priority</th>
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

      <form
        className="service-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await create_review();
        }}
      >
        <button type="submit" className="navbar-link">
          Add a new review
        </button>
      </form>
    </div>
  );
}
