import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServicePoEGeneration = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleServicePoEGeneration = async (
    adminCap: string,
    serviceId: string,
    recipient: string,
  ) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::generate_proof_of_experience`,
      arguments: [
        tx.object(adminCap),
        tx.object(serviceId),
        tx.pure(recipient),
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
            console.log("POE generated");
            toast.success("POE generated");
            return;
          } else {
            console.log("POE generated failed");
            toast.error("POE generated failed.");
            return;
          }
        } catch (err) {
          console.log("POE generated failed");
          console.log(err);
          toast.error("Something went wrong");
        }
      })
      .catch(() => {
        console.log("Error while signing tx");
      });
  };

  return { handleServicePoEGeneration };
};
