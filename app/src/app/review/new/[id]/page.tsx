"use client";

import { useParams } from "next/navigation";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWalletKit } from "@mysten/wallet-kit";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export default function Service() {
  const { signAndExecuteTransactionBlock, currentAccount } = useWalletKit();
  const router = useRouter();
  const { id } = useParams();
  const [reviewBody, setReviewBody] = useState(
    "please enter any text here ...",
  );

  const handleReviewBodyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReviewBody(event.target.value);
  };

  const SUI_CLOCK =
    "0x0000000000000000000000000000000000000000000000000000000000000006";

  // useEffect(() => {
  // }, [currentAccount]);

  const create_review = async (): Promise<void> => {
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

    // window.location.reload();
    router.push(`/service/${id}`);
  };

  return (
    <div className="flex flex-col mx-32 my-10">
      {!!currentAccount && (
        <div>
          <h1>New Review</h1>
          <div>Service Id: {`${id}`}</div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await create_review();
            }}
          >
            <div className="form-group space-x-8">
              <label className="navbar-link">Content</label>
              <input
                className="navbar-input"
                type="text"
                id="reviewBody"
                value={reviewBody}
                onChange={handleReviewBodyChange}
                placeholder="Enter review"
                style={{
                  width: "500px",
                  height: "200px",
                }}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-fit rounded"
            >
              Add a new review
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
