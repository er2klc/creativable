import * as z from "zod";

export const formSchema = z.object({
  language: z.string(),
  displayName: z.string().min(1, "Display Name ist erforderlich"),
  phoneNumber: z.string()
    .refine(value => {
      // Allow empty phone number
      if (!value) return true;
      // Must start with + and contain only digits
      return /^\+[0-9]+$/.test(value);
    }, {
      message: "Telefonnummer muss im internationalen Format sein (z.B. +491621234567)",
    }),
  email: z.string().email(),
});

export const formatPhoneNumber = (phone: string) => {
  if (!phone) return "";
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Ensure it starts with +
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};