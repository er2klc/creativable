import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, Mail, Phone, MapPin, Link } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { LinkedInProfile } from "./bio/LinkedInProfile";
import { InstagramProfile } from "./bio/InstagramProfile";
import { BioAndInterestsFields } from "./bio/BioAndInterestsFields";
import { Lead } from "@/integrations/supabase/types/leads";
import { getAvatarUrl } from "@/lib/supabase-utils";

interface LeadSummaryProps {
  lead: Lead;
  onUpdateLead: (values: Partial<Lead>) => void;
}

export const LeadSummary = ({ lead, onUpdateLead }: LeadSummaryProps) => {
  const { settings } = useSettings();

  const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const locale = settings?.language === "de" ? de : enUS;
    return format(date, "dd. MMMM yyyy", { locale });
  };

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>
          {settings?.language === "en" ? "Lead Summary" : "Lead Zusammenfassung"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={getAvatarUrl(lead.avatar_url)} alt={lead.display_name} />
            <AvatarFallback>{getInitials(lead.display_name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{lead.display_name}</h2>
            <p className="text-sm text-muted-foreground">
              {lead.job_title}, {lead.current_company_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {settings?.language === "en" ? "Contact Information" : "Kontaktinformationen"}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lead.email || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone_number || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {lead.city || "N/A"}, {lead.country || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                <span>{lead.website || "N/A"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">
              {settings?.language === "en" ? "Lead Information" : "Lead Informationen"}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {settings?.language === "en" ? "Phase:" : "Phase:"}
                  <Badge className="ml-2">{lead.phase?.name || "Unknown"}</Badge>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {settings?.language === "en" ? "Value:" : "Wert:"}
                  <Badge className="ml-2">{lead.estimated_value || "N/A"}</Badge>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {settings?.language === "en" ? "Contact Type:" : "Kontakt Typ:"}
                  <Badge className="ml-2">{lead.contact_type || "N/A"}</Badge>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {settings?.language === "en" ? "Created:" : "Erstellt:"}
                  <Badge className="ml-2">{getFormattedDate(lead.created_at)}</Badge>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lead.linkedin_profile && (
            <LinkedInProfile
              linkedinUrl={lead.linkedin_profile}
              displayName={lead.display_name}
            />
          )}
          {lead.apify_instagram_data && (
            <InstagramProfile instagramData={lead.apify_instagram_data} />
          )}
        </div>

        <BioAndInterestsFields
          lead={lead}
          onUpdateLead={onUpdateLead}
        />
      </CardContent>
    </Card>
  );
};
