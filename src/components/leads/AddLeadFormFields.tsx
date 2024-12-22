import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok", "Andere"] as const;
const industries = ["Gesundheit", "Marketing", "Technologie", "Bildung", "Finanzen", "Andere"] as const;

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "Instagram":
      return <Instagram className="h-4 w-4 mr-2" />;
    case "LinkedIn":
      return <Linkedin className="h-4 w-4 mr-2" />;
    case "Facebook":
      return <Facebook className="h-4 w-4 mr-2" />;
    case "TikTok":
      return <Video className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

interface AddLeadFormFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  otherPlatform: boolean;
  setOtherPlatform: (value: boolean) => void;
}

export const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum([...platforms]),
  customPlatform: z.string().optional(),
  phase: z.enum(["initial_contact", "follow_up", "closing"]),
  industry: z.string().min(1, "Branche ist erforderlich 🏢"),
  lastAction: z.string().optional(),
  notes: z.string().optional(),
});

export function AddLeadFormFields({ form, otherPlatform, setOtherPlatform }: AddLeadFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name 👤</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plattform 🌐</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setOtherPlatform(value === "Andere");
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Plattform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    <div className="flex items-center">
                      {getPlatformIcon(platform)}
                      {platform}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {otherPlatform && (
        <FormField
          control={form.control}
          name="customPlatform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Andere Plattform 🔍</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Twitter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="phase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phase 📊</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Phase" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="initial_contact">✨ Erstkontakt</SelectItem>
                <SelectItem value="follow_up">🔄 Follow-up</SelectItem>
                <SelectItem value="closing">🎯 Abschluss</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branche 🏢</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Branche" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Letzte Aktion 📝</FormLabel>
            <FormControl>
              <Input placeholder="z.B. Nachricht gesendet" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notizen 📌</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Zusätzliche Informationen zum Lead..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}