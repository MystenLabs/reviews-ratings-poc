"use client";

import React, { useState } from "react";
import { useGetOwnedPoes } from "@/app/hooks/useGetOwnedPoes";
import { Button, Modal, Label, Textarea, TextInput } from "flowbite-react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import crypto from "crypto";
import { useWalletKit } from "@mysten/wallet-kit";

const OwnedServicesPage = () => {
  const { signAndExecuteTransactionBlock, currentAccount } = useWalletKit();
  const { dataPoes } = useGetOwnedPoes();

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [poeId, setPoeId] = useState("");
  const [reviewBody, setReviewBody] = useState("");

  const SUI_CLOCK =
    "0x0000000000000000000000000000000000000000000000000000000000000006";

  const onSubmitReview = async () => {
    const tx = new TransactionBlock();

    console.log(`serviceId=${serviceId}`);
    console.log(`poeId=${poeId}`);
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
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review`,
      arguments: [
        tx.object(serviceId),
        tx.pure(currentAccount?.address),
        tx.pure(kvStoreKey),
        tx.pure(reviewBody.length),
        tx.object(SUI_CLOCK),
        tx.object(poeId),
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
      <h1>Services</h1>
      <div className="container">
        {dataPoes.length > 0 && (
          <table className="table-style">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dataPoes.map((item) => (
                <tr key={item.id.id}>
                  <td>{item.id.id}</td>
                  <td>{item.service_id}</td>
                  <td>
                    {
                      <Button
                        onClick={() => {
                          setServiceId(item.service_id);
                          setPoeId(item.id.id);
                          setOpenModal(true);
                        }}
                      >
                        Write a review
                      </Button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Modal show={openModal} onClose={() => setOpenModal(false)}>
          <Modal.Header>Write a New Review</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <div className="mb-2 block">
                  <Label>Service Id</Label>
                </div>
                <TextInput id="serviceId" value={serviceId} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label>POE Id</Label>
                </div>
                <TextInput id="poeId" value={poeId} disabled />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="reviewBody" value="Content" />
                </div>
                <Textarea
                  id="reviewBody"
                  placeholder="Leave a review"
                  value={reviewBody}
                  onChange={(event) => setReviewBody(event.target.value)}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                setOpenModal(false);
                onSubmitReview();
              }}
            >
              Submit
            </Button>
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default OwnedServicesPage;
