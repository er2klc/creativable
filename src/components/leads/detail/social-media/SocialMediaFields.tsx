import { Input } from "@/components/ui/input";
import { Globe, ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Platform, platformsConfig, generateSocialMediaUrl } from "@/config/platforms";

interface SocialMediaFieldsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function SocialMediaFields({ lead, onUpdate }: SocialMediaFieldsProps) {
  const { settings } = useSettings();

  return (
    <>
      <div>
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Globe className="h-4 w-4 text-gray-900" />
          {settings?.language === "en" ? "Platform" : "Plattform"}
        </dt>
        <dd className="flex items-center gap-2">
          <Select
            value={lead.platform as Platform}
            onValueChange={(value: Platform) => onUpdate({ platform: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platformsConfig.map((platform) => (
                <SelectItem key={platform.name} value={platform.name}>
                  <div className="flex items-center gap-2">
                    <platform.icon className="h-4 w-4" />
                    {platform.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </dd>
      </div>
      <div>
        <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Globe className="h-4 w-4 text-gray-900" />
          {settings?.language === "en" ? "Social Media Username" : "Social Media Benutzername"}
        </dt>
        <dd className="flex items-center gap-2">
          <Input
            value={lead.social_media_username || ""}
            onChange={(e) => onUpdate({ social_media_username: e.target.value })}
            placeholder={settings?.language === "en" ? "Enter username" : "Benutzername eingeben"}
          />
          {lead.social_media_username && lead.platform !== "Offline" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(generateSocialMediaUrl(lead.platform as Platform, lead.social_media_username || ''), '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </dd>
      </div>
    </>
  );
}