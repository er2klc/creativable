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
import { Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";

const MEETING_TYPES = [
  { value: "phone_call", label: "Telefongespräch", icon: <Phone className="h-4 w-4" /> },
  { value: "on_site", label: "Vor-Ort-Termin", icon: <MapPin className="h-4 w-4" /> },
  { value: "zoom", label: "Zoom Meeting", icon: <Video className="h-4 w-4" /> },
  { value: "initial_meeting", label: "Erstgespräch", icon: <Users className="h-4 w-4" /> },
  { value: "presentation", label: "Präsentation", icon: <BarChart className="h-4 w-4" /> },
  { value: "follow_up", label: "Folgetermin", icon: <RefreshCw className="h-4 w-4" /> }
] as const;

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
                  <div className="flex items-center gap-2">
                    {type.icon}
                    {type.label}
                  </div>
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