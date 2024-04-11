import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceModerator = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleAddModerator = async (modCap: string, recipient: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::moderator::add_moderator`,
      arguments: [tx.object(modCap), tx.pure(recipient)],
    });
    tx.setGasBudget(1000000000);
    return signTransactionBlock({
      transactionBlock: tx,
    })
      .then(async (signedTx: any) => {
        try {
          let resp = await executeSignedTransactionBlock({
            signedTx,
            requestType: "WaitForLocalExecution",
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Moderator added");
            toast.success("Moderator added");
            return;
          } else {
            console.log("Moderator added failed");
            toast.error("Moderator added failed.");
            return;
          }
        } catch (err) {
          console.log("Moderator added failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  const handleRemoveModerator = async (moderatorId: string) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::moderator::delete_moderator`,
      arguments: [tx.object(moderatorId)],
    });
    tx.setGasBudget(1000000000);
    return signTransactionBlock({
      transactionBlock: tx,
    })
      .then(async (signedTx: any) => {
        try {
          let resp = await executeSignedTransactionBlock({
            signedTx,
            requestType: "WaitForLocalExecution",
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Moderator removed");
            toast.success("Moderator removed");
            return;
          } else {
            console.log("Moderator removed failed");
            toast.error("Moderator removed failed.");
            return;
          }
        } catch (err) {
          console.log("Moderator removed failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  const handleRemoveReview = async (
    moderatorId: string,
    serviceId: string,
    reviewId: string,
  ) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::remove_review`,
      arguments: [
        tx.object(moderatorId),
        tx.object(serviceId),
        tx.pure(reviewId),
      ],
    });
    tx.setGasBudget(1000000000);
    return signTransactionBlock({
      transactionBlock: tx,
    })
      .then(async (signedTx: any) => {
        try {
          let resp = await executeSignedTransactionBlock({
            signedTx,
            requestType: "WaitForLocalExecution",
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Review deleted");
            toast.success("Review deleted");
            return;
          } else {
            console.log("Review delete failed");
            toast.error("Review delete failed.");
            return;
          }
        } catch (err) {
          console.log("Review delete failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  return { handleAddModerator, handleRemoveModerator, handleRemoveReview };
};
