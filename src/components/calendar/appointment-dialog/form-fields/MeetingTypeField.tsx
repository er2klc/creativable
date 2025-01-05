import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

const MEETING_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Telefonat" },
  { value: "video_call", label: "Video Call" },
  { value: "follow_up", label: "Follow-up" },
] as const;

type MeetingType = typeof MEETING_TYPES[number]["value"];

interface MeetingTypeFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingTypeField = ({ form }: MeetingTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="meeting_type"
      rules={{ required: "Bitte wähle eine Terminart aus" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Terminart</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Terminart" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {MEETING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};