import { useNavigate, useSearchParams } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "@/context/user/createUserContext"
import { type LocalErrorResponse } from "@/types/error"
import type { AxiosError } from "axios"
import { getErrorMessage } from "@/lib/formatError"
import { toast } from "sonner"
import { LoginForm } from "@/components/shared/loginForm/loginForm"
import type { LoginFormSchema } from "@/components/shared/loginForm/loginFormSchema"

export default function Login() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { login } = useContext(UserContext)

	const returnTo = searchParams.get("returnTo") || "/"

	const onSubmit = async (values: LoginFormSchema) => {
		login({ credential: values.credential, password: values.password })
			.then(() => {
				console.log(returnTo)
				navigate(returnTo)
			})
			.catch((err: AxiosError<LocalErrorResponse>) => {
				const error = err.response!.data
				
				toast.error(getErrorMessage(error), {
					description: "Por favor verifica tus credenciales e intenta de nuevo."
				})
			})
	}

	return (
		<LoginForm onSubmit={onSubmit} returnTo={returnTo}/>
	)
}
