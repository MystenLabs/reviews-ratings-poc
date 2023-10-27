
import { toast } from "react-hot-toast";
import { Result } from "../types/Result";


export const useRegisterService = async (
    onSuccess: any, 
    serviceId: string, 
    dashBoard: string, 
    setIsLoading: any
    ) => {
    fetch("/api/dashboard/register", {
      method: "POST",
      body: JSON.stringify({ serviceId, dashBoard }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          throw new Error(res.error);
        }
        const createRes = res as Re;
        console.log("maskedQuestions", createRes);
        // Need to add transaction Digest or Dashboard obejct ID. 
        // onSuccess(quizId);
      })
      .catch((err) => {
        console.log("Register service to Dashboard failed", err);
        toast.error("Something went wrong, could not register service to dashboard.");
        setIsLoading(false);
        return;
      });
  };
