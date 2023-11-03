"use client";

import { useParams } from "next/navigation";
import { useGetReview } from "../../hooks/useGetReview";
import { useEffect, useState } from "react";

export default function Service() {
  const { id } = useParams();
  const { dataReview, dataReviewBody, isLoading, isError, currentAccount } =
    useGetReview(id);

  if (!currentAccount) {
    return <h3>Wallet not connected</h3>;
  }

  const renderContent = () => {
    if (isLoading) {
      return <h3>Loading...</h3>;
    }
    if (isError) {
      return <h3>Error</h3>;
    }
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
        <div className="flex flex-row space-x-6 w-screen">
          <h2 className="self-center">Content</h2>
          <p className="box-border w-150px p-4 border-4 hover:box-content">{`${dataReviewBody}`}</p>
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
