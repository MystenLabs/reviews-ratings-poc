"use client";

import { useParams } from "next/navigation";
import { useGetReview } from "../../hooks/useGetReview";
import { useReviewLocking } from "../../hooks/useReviewLocking";
import { useReviewVoting } from "../../hooks/useReviewVoting";
import React, { useState } from "react";

export default function Service() {
  const { id } = useParams();
  const { dataReview, dataReviewBody, isLoading, isError, currentAccount } =
    useGetReview(id);
  const { handleReviewLocking } = useReviewLocking();
  const { handleUpvote, handleDownvote } = useReviewVoting();
  const [isReviewLockLoading, setIsReviewLockLoading] = useState(false);

  if (!currentAccount) {
    return <h3>Wallet not connected</h3>;
  }

  const onLockReview = async () => {
    const res = await handleReviewLocking(id, setIsReviewLockLoading);
    console.log("lockReview: " + res);
    window.location.reload();
  };

  const onUnlockReview = async () => {};

  const onUpvote = async (serviceId: string) => {
    const res = await handleUpvote(serviceId, id);
    console.log("upvoteReview: " + res);
    window.location.reload();
  };

  const onDownvote = async (serviceId: string) => {
    const res = await handleDownvote(serviceId, id);
    console.log("upvoteReview: " + res);
    window.location.reload();
  };

  const renderContent = () => {
    if (isLoading) {
      return <h3>Loading...</h3>;
    }
    if (isError) {
      return <h3>Error</h3>;
    }

    let isOwner = currentAccount?.address === dataReview?.owner;
    let showLockButton = !dataReview?.is_locked && isOwner;
    let showUnlockButton = dataReview?.is_locked;
    return (
      <div className="m-5 space-y-3">
        <div>Id: {`${id}`}</div>
        <div>Owner: {`${dataReview?.owner}`}</div>
        <div>Service Id: {`${dataReview?.service_id}`}</div>
        <div>Hash: {`${dataReview?.hash}`}</div>
        <div>Len: {`${dataReview?.len}`}</div>
        <div>Votes: {`${dataReview?.votes}`}</div>
        <div>Time issued: {`${dataReview?.time_issued}`}</div>
        <div>Has POE: {`${dataReview?.has_poe}`}</div>
        <div>Total Score: {`${dataReview?.ts}`}</div>
        <div>Is locked: {`${dataReview?.is_locked}`}</div>
        <div className="flex flex-row space-x-6">
          <h2 className="self-center">Content</h2>
          {dataReview?.is_locked && (
            <p className="w-1/2 box-border p-4 border-4">locked</p>
          )}
          {!dataReview?.is_locked && (
            <p className="w-1/2 box-border p-4 border-4">{`${dataReviewBody}`}</p>
          )}
        </div>
        <div className="flex flex-row space-x-6">
          {showLockButton && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-80 rounded"
              onClick={() => onLockReview()}
            >
              Lock Review
            </button>
          )}
          {showUnlockButton && (
            <button
              className="bg-blue-400 hover:bg-blue-700 text-white font-bold py-2 px-4 w-80 rounded"
              onClick={() => onUnlockReview()}
            >
              Unlock Review
            </button>
          )}
        </div>
        <div className="flex flex-row space-x-6">
          <button
            className="bg-green-400 hover:bg-gree-700 text-white font-bold py-2 px-4 w-40 rounded"
            onClick={() => onUpvote(`${dataReview?.service_id}`)}
          >
            Up Vote
          </button>
          <button
            className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 w-40 rounded"
            onClick={() => onDownvote(`${dataReview?.service_id}`)}
          >
            Down Vote
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col mx-32 my-10">
      <h1>Review</h1>
      {renderContent()}
    </div>
  );
}