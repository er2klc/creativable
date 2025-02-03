import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { ContactField } from "./form-fields/ContactField";
import { TimeField } from "./form-fields/TimeField";
import { TitleField } from "./form-fields/TitleField";
import { ColorField } from "./form-fields/ColorField";
import { MeetingTypeField } from "./form-fields/MeetingTypeField";
import { Form } from "@/components/ui/form";

interface AppointmentFormProps {
  onSubmit: (values: any) => void;
  defaultValues?: {
    id?: string;
    leadId: string;
    time: string;
    endTime?: string;
    title: string;
    color: string;
    meeting_type: string;
  };
  isEditing?: boolean;
}

export const AppointmentForm = ({
  onSubmit,
  defaultValues,
  isEditing = false,
}: AppointmentFormProps) => {
  const { settings } = useSettings();
  const form = useForm({
    defaultValues: {
      leadId: defaultValues?.leadId || "",
      time: defaultValues?.time || "09:00",
      endTime: defaultValues?.endTime || "",
      title: defaultValues?.title || "",
      color: defaultValues?.color || "#40E0D0",
      meeting_type: defaultValues?.meeting_type || "phone_call",
    },
  });

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TitleField form={form} />
        <ContactField form={form} />
        <TimeField form={form} />
        <MeetingTypeField form={form} />
        <ColorField form={form} />
        
        <div className="flex justify-end">
          <Button type="submit">
            {isEditing
              ? settings?.language === "en"
                ? "Update Appointment"
                : "Termin aktualisieren"
              : settings?.language === "en"
              ? "Create Appointment"
              : "Termin erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
};