import type { LocalErrorResponse } from "@/types/error";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { getErrorMessage } from "./formatError";

export const queryOrMutationDefaultOnError = (e: AxiosError<LocalErrorResponse>) => {
  toast.error(getErrorMessage(e.response!.data))
}