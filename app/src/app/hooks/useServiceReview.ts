import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiMoveObject } from "@mysten/sui.js";

export const useServiceReview = () => {
  const { executeSignedTransactionBlock, suiClient } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleDeleteReview = async (delistedId: string, reviewId: string) => {
    // todo: get ServiceId from reviewId
    let serviceId = "";
    await suiClient
      .getObject({
        id: reviewId,
        options: {
          showContent: true,
        },
      })
      .then(async (res) => {
        // console.log(res);
        serviceId = (res.data?.content as SuiMoveObject).fields.service_id;
      })
      .catch((err) => {
        console.log(err);
        toast.error("Review delete failed.");
        return;
      });

    const tx = new TransactionBlock();
    console.log(`serviceId=${serviceId} reviewId=${reviewId} delistedId=${delistedId}`);
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::delete_review`,
      arguments: [
        tx.object(serviceId),
        tx.object(reviewId),
        tx.object(delistedId),
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
      .catch((err) => {
        console.log("Error while signing tx" + err);
      });
  };

  return { handleDeleteReview };
};
