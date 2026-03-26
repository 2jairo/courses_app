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
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { loginFormSchema, type LoginFormSchema } from "./loginFormSchema"
import { AppLogo } from "../appLogo/appLogo"


interface LoginFormProps {
  onSubmit: (values: LoginFormSchema) => Promise<void>
	returnTo: string
}
export const LoginForm = ({ onSubmit, returnTo }: LoginFormProps) => {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormSchema>({
		resolver: zodResolver(loginFormSchema),
		defaultValues: { credential: "", password: "" },
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
					<p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">Acceso seguro</p>
					<div className="flex items-center gap-1">
						<AppLogo className="w-12 h-12"/>
						
						<h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
							Bienvenido de vuelta
						</h1>
					</div>
					<p className="text-base text-muted-foreground sm:text-lg">
						Accede para gestionar tus cursos y continuar donde lo dejaste.
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
						<CardTitle className="text-xl font-semibold">Inicia sesión</CardTitle>
						<CardDescription>
							Ingresa tus credenciales para continuar
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
							<Field>
								<FieldLabel htmlFor="credential">Correo electrónico o usuario</FieldLabel>
								<FieldContent>
									<Input
										id="credential"
										type="text"
										autoComplete="email"
										placeholder="estudiante@ejemplo.com"
										aria-invalid={!!errors.credential}
										{...register("credential")}
									/>
									<FieldError errors={[errors.credential]} />
								</FieldContent>
							</Field>

							<Field>
								<FieldLabel htmlFor="password">Contraseña</FieldLabel>
								<FieldContent>
									<Input
										id="password"
										type="password"
										autoComplete="current-password"
										placeholder="•••"
										aria-invalid={!!errors.password}
										{...register("password")}
									/>
									<FieldDescription>Usa al menos 8 caracteres. No compartas tu contraseña.</FieldDescription>
									<FieldError errors={[errors.password]} />
								</FieldContent>
							</Field>

							<div className="flex items-center justify-end text-sm">
								<Link
									to="/forgot-password"
									className="text-primary text-sm font-medium transition-colors hover:text-primary/80"
								>
									¿Olvidaste tu contraseña?
								</Link>
							</div>
								
							<div className="flex items-center justify-end text-sm">
								<Link
									to={`/register?returnTo=${returnTo}`}
									className="text-primary text-sm font-medium transition-colors hover:text-primary/80"
								>
									¿No tienes cuenta? Regístrate aquí
								</Link>
							</div>

							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Ingresando..." : "Ingresar"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
