import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { BasicLeadFields } from "./form-fields/BasicLeadFields";
import { NotesFields } from "./form-fields/NotesFields";
import { ContactTypeField } from "./form-fields/ContactTypeField";
import { type Platform } from "@/config/platforms";

export const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.custom<Platform>(),
  social_media_username: z.string().optional(),
  phase_id: z.string().min(1, "Phase ist erforderlich 📊"),
  pipeline_id: z.string().min(1, "Pipeline ist erforderlich"),
  contact_type: z.string().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type FormData = z.infer<typeof formSchema>;

interface AddLeadFormFieldsProps {
  form: UseFormReturn<FormData>;
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