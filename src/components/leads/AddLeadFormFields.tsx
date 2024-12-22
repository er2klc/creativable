import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { BasicLeadFields } from "./form-fields/BasicLeadFields";
import { SocialMediaFields } from "./form-fields/SocialMediaFields";
import { NotesFields } from "./form-fields/NotesFields";

const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok"] as const;

export const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum([...platforms]),
  socialMediaUsername: z.string().min(1, "Benutzername ist erforderlich 📱"),
  phase: z.enum(["initial_contact", "follow_up", "closing"]),
  industry: z.string().min(1, "Branche ist erforderlich 🏢"),
  lastAction: z.string().optional(),
  notes: z.string().optional(),
});

interface AddLeadFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function AddLeadFormFields({ form }: AddLeadFormFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <BasicLeadFields form={form} />
        <SocialMediaFields form={form} />
        <NotesFields form={form} />
      </div>
    </>
  );
}