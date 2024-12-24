import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { platformsConfig, Platform, generateSocialMediaUrl } from "@/config/platforms";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

export { Platform, platforms, generateSocialMediaUrl } from "@/config/platforms";

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum(platformsConfig.map(p => p.name)),
  socialMediaUsername: z.string().min(1, "Benutzername ist erforderlich 📱"),
  phase: z.string().min(1, "Phase ist erforderlich 📊"),
  contact_type: z.string().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  company_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

interface SocialMediaFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function SocialMediaFields({ form }: SocialMediaFieldsProps) {
  const platform = form.watch("platform");
  const username = form.watch("socialMediaUsername");
  const profileUrl = generateSocialMediaUrl(platform, username);

  return (
    <>
      <FormField
        control={form.control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plattform 🌐</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Plattform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {platformsConfig.map((config) => (
                  <SelectItem key={config.name} value={config.name}>
                    <div className="flex items-center">
                      <config.icon className="h-4 w-4 mr-2" />
                      {config.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {platform !== "Offline" && (
        <FormField
          control={form.control}
          name="socialMediaUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benutzername 📱</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input 
                    placeholder="Benutzername (ohne @ oder URL)" 
                    {...field} 
                    onChange={(e) => {
                      const username = e.target.value.replace(/^@/, '');
                      field.onChange(username);
                    }}
                  />
                </FormControl>
                {username && platform !== "Offline" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(profileUrl, '_blank')}
                    title="Profil öffnen"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {platform !== "Offline" && !username && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Kein Profil gefunden. Bitte überprüfen Sie den Benutzernamen.
                  </AlertDescription>
                </Alert>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

export { formSchema };