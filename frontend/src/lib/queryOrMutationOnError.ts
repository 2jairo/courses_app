import type { LocalErrorResponse } from "@/types/error";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getErrorMessage } from "./formatError";
import type { NavigateFunction } from "react-router-dom";

export const queryOrMutationDefaultOnError = (e: AxiosError<LocalErrorResponse>, navigate: NavigateFunction, navigateTo?: string) => {
  toast.error(getErrorMessage(e.response!.data))

  if(navigateTo) {
    navigate(navigateTo)
  }
}