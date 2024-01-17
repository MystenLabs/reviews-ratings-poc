"use client";

import React, { useState } from "react";
import { useGetOwnedPoes } from "@/app/hooks/useGetOwnedPoes";
import { Button, Table } from "flowbite-react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import crypto from "crypto";
import { useWalletKit } from "@mysten/wallet-kit";
import { AddReview } from "@/app/components/review/AddReview";
import { HiOutlinePencilAlt } from "react-icons/hi";

const OwnedServicesPage = () => {
  const { signAndExecuteTransactionBlock, currentAccount } = useWalletKit();
  const { dataPoes } = useGetOwnedPoes();

  const [openModal, setOpenModal] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [poeId, setPoeId] = useState("");

  const SUI_CLOCK =
    "0x0000000000000000000000000000000000000000000000000000000000000006";

  const onSubmitReview = async (reviewBody: string, overallRate: string) => {
    const tx = new TransactionBlock();

    console.log(`serviceId=${serviceId}`);
    console.log(`poeId=${poeId}`);
    console.log(`review_body=${reviewBody}`);
    console.log(`review_len=${reviewBody.length}`);

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review`,
      arguments: [
        tx.object(serviceId),
        tx.pure(currentAccount?.address),
        tx.pure(reviewBody),
        tx.pure(overallRate),
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
      <h1>Recently Visited</h1>
      <p className="my-4 text-lg text-gray-500">
        Obtained the following NFTs by visiting the listed restaurants and
        paying for their services. You may burn an NFT when writing a review for
        the restaurant, and receive a higher score for the review.
      </p>
      <div>
        {dataPoes.length > 0 && (
          <Table hoverable className="items-center text-center">
            <Table.Head>
              <Table.HeadCell>MY OWNED NFT</Table.HeadCell>
              <Table.HeadCell>Service ID</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {dataPoes.map((item) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={item.id.id}
                >
                  <Table.Cell>
                    <div className="overflow-hidden truncate w-48">
                      {item.id.id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="overflow-hidden truncate w-48">
                      {item.service_id}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {
                      <Button
                        color="gray"
                        pill
                        onClick={() => {
                          setServiceId(item.service_id);
                          setPoeId(item.id.id);
                          setOpenModal(true);
                        }}
                      >
                        Review
                        <HiOutlinePencilAlt className="ml-2 h-5 w-5" />
                      </Button>
                    }
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        <AddReview
          serviceId={serviceId}
          poeId={poeId}
          openModal={openModal}
          setOpenModal={setOpenModal}
          onSubmitReview={onSubmitReview}
        />
      </div>
    </div>
  );
};

export default OwnedServicesPage;
