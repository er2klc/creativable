import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { BasicLeadFields } from "./form-fields/BasicLeadFields";
import { NotesFields } from "./form-fields/NotesFields";

const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok"] as const;
const contactTypes = ["Partner", "Kunde"] as const;

export const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum([...platforms]),
  socialMediaUsername: z.string().min(1, "Benutzername ist erforderlich 📱"),
  phase: z.string().min(1, "Phase ist erforderlich 📊"),
  contact_type: z.enum([...contactTypes]).nullable(),
  phone_number: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  company_name: z.string().optional(),
  notes: z.string().optional(),
  industry: z.string().default(""), // Keep industry for OpenAI
});

interface AddLeadFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function AddLeadFormFields({ form }: AddLeadFormFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <BasicLeadFields form={form} />
        <NotesFields form={form} />
      </div>
    </>
  );
}