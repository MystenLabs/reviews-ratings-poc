"use client";
import { useParams } from "next/navigation";
import { useGetReviews } from "../../hooks/useGetReviews";
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
  const router = useRouter();
  const { id } = useParams();
  const { dataReviews, dataName, isLoading, currentAccount } =
    useGetReviews(id);

  const [reviews, setReviews] = useState([] as ReviewType[]);

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

  return (
    <div className="flex flex-col mx-32 my-10">
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

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-fit rounded"
        onClick={async () => router.push(`/review/new/${id}`)}
      >
        Add a new review
      </button>
    </div>
  );
}
