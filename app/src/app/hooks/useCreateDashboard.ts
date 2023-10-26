import { useWalletKit } from "@mysten/wallet-kit"
import { toast } from "react-hot-toast";
const { currentAccount } = useWalletKit();

const handleCreateDashboardApi = async (onSuccess: any, serviceType: string, setIsLoading: any) => {
    
    const requestAddress = currentAccount?.address;

    fetch("/api/dashboard/create", {
      method: "POST",
      body: JSON.stringify({ serviceType, requestAddress }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        const createRes = res as Dashboard;
        console.log("maskedQuestions", createRes);
        // Need to add transaction Digest or Dashboard obejct ID. 
        // onSuccess(quizId);
      })
      .catch((err) => {
        console.log("dashboard creation failed", err);
        toast.error("Something went wrong, could not create dashboard.");
        setIsLoading(false);
        return;
      });
  };
