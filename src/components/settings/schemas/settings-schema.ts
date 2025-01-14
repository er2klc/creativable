import * as z from "zod";

export const formSchema = z.object({
  displayName: z.string().min(1, "Display Name ist erforderlich"),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  phoneNumber: z.string()
    .refine(value => {
      if (!value) return true;
      return /^\+[0-9]+$/.test(value);
    }, {
      message: "Telefonnummer muss im internationalen Format sein (z.B. +491621234567)",
    }),
  language: z.string(),
});

export type FormData = z.infer<typeof formSchema>;