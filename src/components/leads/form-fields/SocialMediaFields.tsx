import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Instagram, Linkedin, Facebook, Video, Users, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok", "OFFLINE"] as const;

export type Platform = typeof platforms[number];

export const generateSocialMediaUrl = (platform: Platform, username: string) => {
  // Clean the username first
  const cleanUsername = username.replace(/^https?:\/\/[^\/]+\//, '').replace(/^@/, '');
  
  switch (platform) {
    case "Instagram":
      return `https://www.instagram.com/${cleanUsername}`;
    case "LinkedIn":
      return `https://www.linkedin.com/in/${cleanUsername}`;
    case "Facebook":
      return `https://www.facebook.com/${cleanUsername}`;
    case "TikTok":
      return `https://www.tiktok.com/@${cleanUsername}`;
    default:
      return username;
  }
};

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case "Instagram":
      return <Instagram className="h-4 w-4 mr-2" />;
    case "LinkedIn":
      return <Linkedin className="h-4 w-4 mr-2" />;
    case "Facebook":
      return <Facebook className="h-4 w-4 mr-2" />;
    case "TikTok":
      return <Video className="h-4 w-4 mr-2" />;
    case "OFFLINE":
      return <Users className="h-4 w-4 mr-2" />;
  }
};

interface SocialMediaFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich 📝"),
  platform: z.enum(platforms),
  socialMediaUsername: z.string().min(1, "Benutzername ist erforderlich 📱"),
  phase: z.string().min(1, "Phase ist erforderlich 📊"),
  contact_type: z.string().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().nullable(),
  company_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

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

      {platform !== "OFFLINE" && (
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
                {username && profileUrl && (
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
              {platform !== "OFFLINE" && !username && (
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