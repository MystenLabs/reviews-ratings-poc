import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useSignAndExecuteTransaction } from "./useSignAndExecuteTransaction";

export const useServiceCreation = () => {
  const { handleSignAndExecuteTransaction } = useSignAndExecuteTransaction();
  const handleServiceCreationAndRegister = async (
    name: String,
    dashboardId: string,
    setIsLoading: any,
  ) => {
    const tx = new TransactionBlock();
    const serviceCreation = tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::create_service`,
      arguments: [tx.pure(name)],
    });

    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::dashboard::register_service`,
      arguments: [tx.object(dashboardId), serviceCreation],
    });
    setIsLoading(true);
    console.log("Create Service, signing transaction block...");
    return handleSignAndExecuteTransaction(tx, "Create Service", setIsLoading);
  };
  const handleServiceCreationTransactionBlock = async (
    name: String,
    setIsLoading: any,
  ): Promise<TransactionBlock> => {
    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${process.env.NEXT_PUBLIC_PACKAGE}::service::create_service`,
      arguments: [tx.pure(name)],
    });
    setIsLoading(true);
    console.log("Create Service, signing transaction block...");
    return tx;
  };
  return {
    handleServiceCreationAndRegister,
    handleServiceCreationTransactionBlock,
  };
};
