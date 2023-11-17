"use client";

import { useParams } from "next/navigation";
import { useGetReview } from "@/app/hooks/useGetReview";
import { useReviewLocking } from "@/app/hooks/useReviewLocking";
import { useReviewVoting } from "@/app/hooks/useReviewVoting";
import { useReviewGrantAccess } from "@/app/hooks/useReviewGrantAccess";
import { useGetOwnedGrantObjects } from "@/app/hooks/useGetOwnedGrantObjects";
import React, { useState } from "react";
import { Button } from "flowbite-react";
import {
  HiLockClosed,
  HiLockOpen,
  HiOutlinePencilAlt,
  HiThumbDown,
  HiThumbUp,
} from "react-icons/hi";

interface GrantType {
  id: {
    id: string;
  };
  owner: string;
  review_id: string;
}

export default function Service() {
  const { id } = useParams();
  const { dataReview, dataReviewBody, isLoading, isError, currentAccount } =
    useGetReview(id);
  const { handleReviewLocking } = useReviewLocking();
  const { handleUpvote, handleDownvote } = useReviewVoting();
  const { handleReviewAccessGrant } = useReviewGrantAccess();

  const { dataGrants } = useGetOwnedGrantObjects();

  const [isReviewLockLoading, setIsReviewLockLoading] = useState(false);
  const [isGrantAccessLoading, setIsGrantAccessLoading] = useState(false);

  if (!currentAccount) {
    return <h3>Wallet not connected</h3>;
  }

  const onLockReview = async () => {
    const res = await handleReviewLocking(id, setIsReviewLockLoading);
    console.log("lockReview: " + res);
    window.location.reload();
  };

  const onUnlockReview = async () => {
    const res = await handleReviewAccessGrant(
      id,
      1000000000,
      currentAccount.address,
      setIsGrantAccessLoading,
    );
    console.log("unlockReview: " + res);
    window.location.reload();
  };

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
    let isLocked = dataReview?.is_locked;
    let showLockButton = !isLocked && isOwner;
    let showUnlockButton = isLocked && !isOwner;
    let hasGrant = false;
    if (isLocked) {
      // console.log("grantObjs: " + JSON.stringify(dataGrants));
      dataGrants.map((grant: GrantType) => {
        if (grant.owner === currentAccount?.address && grant.review_id === id) {
          hasGrant = true;
          showUnlockButton = false;
        }
      });
    }
    let showContent = true;
    if (!isOwner && isLocked && !hasGrant) showContent = false;

    return (
      <div className="m-5 space-y-3">
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={`${id}`}
            disabled
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`ID:`}</label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={`${dataReview?.owner}`}
            disabled
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Owner:`}</label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={`${dataReview?.service_id}`}
            disabled
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Service ID:`}</label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={`${dataReview?.hash}`}
            disabled
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Hash:`}</label>
        </div>
        <div className="relative z-0 w-full mb-6 group">
          <input
            type="text"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={`${new Date(
              (dataReview?.time_issued as number) / 1,
            ).toLocaleString()}`}
            disabled
          />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Time issued:`}</label>
        </div>
        <div className="grid md:grid-cols-3 md:gap-6">
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={`${dataReview?.len}`}
              disabled
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Length:`}</label>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={`${dataReview?.votes}`}
              disabled
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Number of Votes:`}</label>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={`${dataReview?.ts}`}
              disabled
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Score:`}</label>
          </div>
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={`${dataReview?.has_poe}`}
              disabled
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Has Proof of Experience:`}</label>
          </div>
          <div className="relative z-0 w-full mb-6 group">
            <input
              type="text"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              value={`${dataReview?.is_locked}`}
              disabled
            />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{`Locked:`}</label>
          </div>
        </div>

        <div className="relative w-full">
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75  -z-10 origin-[0] ">{`Content:`}</label>
          {!showContent && (
            <textarea
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              rows={7}
              value={"locked"}
            ></textarea>
          )}
          {showContent && (
            <textarea
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              rows={7}
              value={dataReviewBody}
            ></textarea>
          )}
        </div>

        <div className="flex flex-row space-x-6">
          {showLockButton && (
            <Button color="light" pill onClick={() => onLockReview()}>
              Lock Review
              <HiLockClosed className="ml-2 h-5 w-5" />
            </Button>
          )}
          {showUnlockButton && (
            <Button color="light" pill onClick={() => onUnlockReview()}>
              Unlock Review
              <HiLockOpen className="ml-2 h-5 w-5" />
            </Button>
          )}
          <Button
            color="green"
            pill
            onClick={() => onUpvote(`${dataReview?.service_id}`)}
          >
            Up Vote
            <HiThumbUp className="ml-2 h-5 w-5" />
          </Button>
          <Button
            color="red"
            pill
            onClick={() => onDownvote(`${dataReview?.service_id}`)}
          >
            Down Vote
            <HiThumbDown className="ml-2 h-5 w-5" />
          </Button>
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
