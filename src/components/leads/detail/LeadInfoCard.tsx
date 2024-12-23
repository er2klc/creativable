import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4 mr-2" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4 mr-2" />;
    case "facebook":
      return <Facebook className="h-4 w-4 mr-2" />;
    case "tiktok":
      return <Video className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Platform" : "Plattform"}
            </dt>
            <dd className="flex items-center">
              {getPlatformIcon(lead.platform)}
              {lead.platform}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Industry" : "Branche"}
            </dt>
            <dd>{lead.industry}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Phase" : "Phase"}
            </dt>
            <dd>{lead.phase}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Last Action" : "Letzte Aktion"}
            </dt>
            <dd>
              {lead.last_action ||
                (settings?.language === "en"
                  ? "No action recorded"
                  : "Keine Aktion aufgezeichnet")}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}