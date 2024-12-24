import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { BasicLeadFields } from "./form-fields/BasicLeadFields";
import { NotesFields } from "./form-fields/NotesFields";
import { ContactTypeField } from "./form-fields/ContactTypeField";
import { type Platform, platforms } from "@/config/platforms";

export const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum(platforms as [Platform, ...Platform[]]),
  socialMediaUsername: z.string().optional(),
  phase: z.string().min(1, "Phase ist erforderlich 📊"),
  contact_type: z.string().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  company_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

interface AddLeadFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function AddLeadFormFields({ form }: AddLeadFormFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <BasicLeadFields form={form} />
        <ContactTypeField form={form} />
        <NotesFields form={form} />
      </div>
    </>
  );
}