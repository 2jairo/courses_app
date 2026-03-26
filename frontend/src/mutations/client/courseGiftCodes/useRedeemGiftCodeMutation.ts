import { queryOrMutationDefaultOnError } from "@/lib/queryOrMutationOnError"
import { ClientCourseGiftCodesService } from "@/services/client/clientCourseGiftCodes.service"
import type { RedeemGiftCodeRequest, RedeemGiftCodeResponse } from "@/types/client/courseGiftCodes"
import type { LocalErrorResponse } from "@/types/error"
import type { AxiosError } from "axios"
import { useMutation } from "react-query"
import { useNavigate } from "react-router-dom"

export const useRedeemGiftCodeMutation = () => {
  const navigate = useNavigate()

  return useMutation<RedeemGiftCodeResponse, AxiosError<LocalErrorResponse>, RedeemGiftCodeRequest>({
    mutationFn: (data) => ClientCourseGiftCodesService.redeemGiftCode(data),
    onError: (e) => queryOrMutationDefaultOnError(e, navigate),
  })
}
