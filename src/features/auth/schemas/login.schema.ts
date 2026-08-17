import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido")
    .transform(value => value.toLowerCase()),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.input<typeof loginSchema>;
