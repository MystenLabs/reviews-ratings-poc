"use client";

import { useParams } from "next/navigation";
import { useGetReviews } from "../../hooks/useGetReviews";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWalletKit } from "@mysten/wallet-kit";

export default function Service() {
  const { signAndExecuteTransactionBlock } = useWalletKit();
  const { id } = useParams();
  const { data, isLoading, isError, currentAccount } = useGetReviews(id);

  const SUI_CLOCK =
    "0x0000000000000000000000000000000000000000000000000000000000000006";

  const create_review = async (): Promise<void> => {
    const tx = new TransactionBlock();

    console.log(`serviceId=${id}`);

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::write_new_review_without_poe`,
      arguments: [
        tx.object(id),
        tx.pure(currentAccount?.address),
        tx.pure(Array.from("1234"), "vector<u8>"),
        tx.pure(200 * Math.random()),
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
      <div>Name: {`name`}</div>
      <div>Id: {`${id}`}</div>
      <div>Data: {`${data.length}`}</div>

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
