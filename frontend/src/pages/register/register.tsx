import { useNavigate, useSearchParams } from "react-router-dom"
import { useContext, useEffect } from "react"
import { UserContext } from "@/context/user/createUserContext"
import { type LocalErrorResponse } from "@/types/error"
import type { AxiosError } from "axios"
import { getErrorMessage } from "@/lib/formatError"
import { toast } from "sonner"
import type { RegisterFormSchema } from "@/components/shared/registerForm/registerFormSchema"
import { RegisterForm } from "@/components/shared/registerForm/registerForm"
import { setDocumentTitle } from "@/lib/documentTitle"

export default function Register() {
	useEffect(() => {
		setDocumentTitle("Registro", true)		
	}, [])
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { register } = useContext(UserContext)

	const returnTo = searchParams.get("returnTo") || "/"

	const onSubmit = async (values: RegisterFormSchema) => {
		register({
			birth_date: values.birthDate,
			email: values.email,
			password: values.password,
			sex: values.sex,
			username: values.username
		})
		.then(() => {
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
		<RegisterForm onSubmit={onSubmit} returnTo={returnTo}/>
	)
}
