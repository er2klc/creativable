import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Instagram, Linkedin, Facebook, Video, Users, ExternalLink, AlertTriangle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok", "OFFLINE"] as const;

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
    case "OFFLINE":
      return <Users className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

export const generateSocialMediaUrl = (platform: string, username: string): string => {
  if (!username) return '';
  switch (platform) {
    case "Instagram":
      return `https://www.instagram.com/${username}`;
    case "LinkedIn":
      return `https://www.linkedin.com/in/${username}`;
    case "Facebook":
      return `https://www.facebook.com/${username}`;
    case "TikTok":
      return `https://www.tiktok.com/@${username}`;
    default:
      return '';
  }
};

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

export { generateSocialMediaUrl };