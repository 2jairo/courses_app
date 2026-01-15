import { z } from "zod"

export const loginFormSchema = z.object({
  credential: z
    .string({ error: "credenciales inválidas" })
    .min(3, "Mínimo 3 carácteres")
    .max(100, "Máximo 100 carácteres"),
  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(3, "Mínimo 3 carácteres")
    .max(100, "Máximo 100 carácteres"),
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>
