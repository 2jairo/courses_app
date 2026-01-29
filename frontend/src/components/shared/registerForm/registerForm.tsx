import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { registerFormSchema, type RegisterFormSchema } from "./registerFormSchema"


interface RegisterFormProps {
  onSubmit: (values: RegisterFormSchema) => Promise<void>
}
export const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormSchema>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: { 
			username: "", 
			email: "", 
			password: "", 
			passwordRepeat: "",
			birthDate: undefined,
			sex: undefined
		},
		mode: "onBlur",
	})

	const points = [
		"Progreso sincronizado en todos tus dispositivos",
		"Recordatorios personalizados de clases y tareas",
		"Soporte rápido con respuestas en minutos",
	]

	return (
		<section className="relative p-10 flex-1 flex flex-col align-middle justify-center">
			<div className="pointer-events-none inset-35 absolute -z-10 bg-linear-to-tr rounded-4xl rom-primary/10 via-sky-400/20 to-blue-500/10 blur-3xl" />

			<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
				<div className="flex flex-col justify-center gap-6 text-balance">
					<p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">Únete ahora</p>
					<h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
						Comienza tu aprendizaje
					</h1>
					<p className="text-base text-muted-foreground sm:text-lg">
						Crea tu cuenta para acceder a todos los cursos y recursos.
					</p>
					<ul className="grid gap-3 text-sm text-muted-foreground sm:text-base">
						{points.map((point) => (
							<li key={point} className="flex items-center gap-2">
								<span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
									•
								</span>
								<span>{point}</span>
							</li>
						))}
					</ul>
				</div>

				<Card className="backdrop-blur shadow-lg ring-1 ring-black/5 dark:ring-white/10">
					<CardHeader className="space-y-2">
						<CardTitle className="text-xl font-semibold">Crear cuenta</CardTitle>
						<CardDescription>
							Completa el formulario para registrarte
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
							<Field>
							<FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
							<FieldContent>
								<Input
									id="username"
									type="text"
									autoComplete="username"
									placeholder="usuario123"
									aria-invalid={!!errors.username}
									{...register("username")}
								/>
								<FieldError errors={[errors.username]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
							<FieldContent>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="estudiante@ejemplo.com"
									aria-invalid={!!errors.email}
									{...register("email")}
								/>
								<FieldError errors={[errors.email]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="password">Contraseña</FieldLabel>
							<FieldContent>
								<Input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder="•••"
									aria-invalid={!!errors.password}
									{...register("password")}
								/>
								<FieldError errors={[errors.password]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="passwordRepeat">Confirmar contraseña</FieldLabel>
							<FieldContent>
								<Input
									id="passwordRepeat"
									type="password"
									autoComplete="new-password"
									placeholder="•••"
									aria-invalid={!!errors.passwordRepeat}
									{...register("passwordRepeat")}
								/>
								<FieldError errors={[errors.passwordRepeat]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
							<FieldContent>
								<Input
									id="birthDate"
									type="date"
									aria-invalid={!!errors.birthDate}
									{...register("birthDate", {
										valueAsDate: true,
									})}
								/>
								<FieldError errors={[errors.birthDate]} />
							</FieldContent>
						</Field>

						<Field>
							<FieldLabel htmlFor="sex">Sexo</FieldLabel>
							<FieldContent>
								<Select
									onValueChange={(value) => {
										register("sex").onChange({ target: { value, name: "sex" } })
									}}
								>
									<SelectTrigger id="sex" aria-invalid={!!errors.sex}>
										<SelectValue placeholder="Selecciona tu sexo" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Male">Masculino</SelectItem>
										<SelectItem value="Female">Femenino</SelectItem>
										<SelectItem value="Other">Otro</SelectItem>
									</SelectContent>
								</Select>
								<FieldError errors={[errors.sex]} />
							</FieldContent>
						</Field>

					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Registrando..." : "Registrarse"}
					</Button>
				</form>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
