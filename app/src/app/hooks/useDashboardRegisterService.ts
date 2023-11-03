import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";
// has to be async
export const useDashboardRegisterService = () => {
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleRegisterService = async(
    dashboard_obj: any,
    service_id: any,
    setIsLoading: any
  ) => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::dashboard::register_service`,
      arguments: [
        tx.object(dashboard_obj),
        tx.pure(service_id),
      ],
    });
    setIsLoading(true);
    console.log("useDashboardRegisterService, signing transaction block...");
    return handleSignAndExecuteTransaction(tx, "DashboardRegisterService", setIsLoading);;
  }

  return { handleRegisterService }
};

