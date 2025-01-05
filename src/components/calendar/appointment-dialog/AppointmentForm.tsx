import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ContactField } from "./form-fields/ContactField";
import { TimeField } from "./form-fields/TimeField";
import { TitleField } from "./form-fields/TitleField";
import { MeetingTypeField } from "./form-fields/MeetingTypeField";
import { ColorField } from "./form-fields/ColorField";
import { PhaseField } from "./form-fields/PhaseField";

interface FormValues {
  leadId: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
  phase: string;
}

interface AppointmentFormProps {
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
}

export const AppointmentForm = ({ onSubmit, defaultValues, isEditing }: AppointmentFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      color: "#FEF7CD",
      meeting_type: "meeting",
      phase: "initial_contact",
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ContactField form={form} />
        <TimeField form={form} />
        <TitleField form={form} />
        <MeetingTypeField form={form} />
        <ColorField form={form} />
        <PhaseField form={form} />

        <div className="flex justify-end gap-2">
          <Button type="submit">
            {isEditing ? "Termin aktualisieren" : "Termin erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
};