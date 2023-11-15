import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceTopUp = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleServiceTopUp = async (
    serviceId: string,
    amount: number,
  ) => {
    const tx = new TransactionBlock();
    const sendAmount = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::top_up_reward`,
      arguments: [
        tx.object(serviceId),
        sendAmount,
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
            console.log("TopUp generated");
            toast.success("TopUp generated");
            return;
          } else {
            console.log("TopUp generated failed");
            toast.error("TopUp generated failed.");
            return;
          }
        } catch (err) {
          console.log("TopUp generated failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  return { handleServiceTopUp };
};
