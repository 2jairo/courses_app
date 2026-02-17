import { z } from "zod"

export const UserSex = z.enum(["Male", "Female", "Other"]);

export const registerFormSchema = z.object({
  username: z
    .string({ error: "Credenciales inválidas" })
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  email: z
    .email({ error: "Correo inválido" })
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  password: z
    .string({ error: "La contraseña es obligatoria" })
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  passwordRepeat: z
    .string({ error: "La contraseña es obligatoria" })
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  birthDate: z
    .date({ error: "La fecha de nacimiento es obligatoria" })
    .refine(
      (date) => {
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        return date < threeYearsAgo;
      },
      { message: "Debes tener al menos 3 años" }
    ),

  sex: UserSex,
})
.refine(
  (data) => {
    return data.password === data.passwordRepeat
  },
  {
    message: "Las contraseñas no coinciden",
    path: ["passwordRepeat"],
  }
)

export type RegisterFormSchema = z.infer<typeof registerFormSchema>