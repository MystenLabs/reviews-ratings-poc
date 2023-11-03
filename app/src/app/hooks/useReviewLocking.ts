import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useReviewLocking = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleReviewLocking = async (reviewObj: string, setIsLoading: any) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::review::lock`,
      arguments: [tx.object(reviewObj)],
    });
    tx.setGasBudget(1000000000);
    setIsLoading(true);
    console.log("Locking review, signing transaction block...");
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
          setIsLoading(false);
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Review locked");
            toast.success("Review locked");
            return;
          } else {
            console.log("Review locked failed");
            toast.error("Review locked failed.");
            return;
          }
        } catch (err) {
          setIsLoading(false);
          console.log("Review locked failed");
          console.log(err);
          toast.error("Something went wrong, Review locked failed.");
        }
      })
      .catch(() => {
        setIsLoading(false);
        console.log("Error while signing tx");
      });
  };

  return { handleReviewLocking };
};
