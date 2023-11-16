import { useWalletKit } from "@mysten/wallet-kit";
import { toast } from "react-hot-toast";
import { useSui } from "./useSui";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export const useServiceAddModerator = () => {
  const { executeSignedTransactionBlock } = useSui();
  const { signTransactionBlock } = useWalletKit();

  const handleServiceAddModerator = async (
    adminCap: string,
    serviceId: string,
    recipient: string,
  ) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::add_moderator`,
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

  return { handleServiceAddModerator };
};
