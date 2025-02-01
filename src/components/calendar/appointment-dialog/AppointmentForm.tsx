import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TimeField } from "./form-fields/TimeField";
import { TitleField } from "./form-fields/TitleField";
import { ColorField } from "./form-fields/ColorField";
import { MeetingTypeField } from "./form-fields/MeetingTypeField";
import { ContactField } from "./form-fields/ContactField";

interface AppointmentFormProps {
  onSubmit: (values: any) => void;
  defaultValues?: {
    leadId?: string;
    time?: string;
    date?: string;
    title?: string;
    color?: string;
    meeting_type?: string;
  };
  isEditing?: boolean;
}

export const AppointmentForm = ({
  onSubmit,
  defaultValues,
  isEditing = false,
}: AppointmentFormProps) => {
  const form = useForm({
    defaultValues: {
      leadId: defaultValues?.leadId || "",
      time: defaultValues?.time || "",
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      title: defaultValues?.title || "",
      color: defaultValues?.color || "#4CAF50",
      meeting_type: defaultValues?.meeting_type || "meeting",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TitleField form={form} />
        <TimeField form={form} />
        <ColorField form={form} />
        <MeetingTypeField form={form} />
        <ContactField form={form} />
        
        <Button type="submit" className="w-full">
          {isEditing ? "Aktualisieren" : "Termin erstellen"}
        </Button>
      </form>
    </Form>
  );
};