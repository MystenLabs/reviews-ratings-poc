import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

export const useServiceReward = () => {
  const { executeSignedTransaction } = useSui();
  const { signTransaction } = useWalletKit();

  const handleServiceReward = async (adminCap: string, serviceId: string) => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::distribute_reward`,
      arguments: [tx.object(adminCap), tx.object(serviceId)],
    });
    tx.setGasBudget(1000000000);
    return signTransaction({
      transactionBlock: tx,
    })
      .then(async (signedTx: any) => {
        try {
          let resp = await executeSignedTransaction({
            signedTx,
            requestType: "WaitForLocalExecution",
            options: {
              showEffects: true,
              showEvents: true,
            },
          });
          console.log(resp);
          if (resp.effects?.status.status === "success") {
            console.log("Reward generated");
            toast.success("Reward generated");
            return;
          } else {
            console.log("Reward generated failed");
            toast.error("Reward generated failed.");
            return;
          }
        } catch (err) {
          console.log("Reward generated failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  return { handleServiceReward };
};
