import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Contact2, Building2, Users, Phone, Mail, MapPin, Calendar, Brain, Sparkles } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ContactInfoSectionsProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function ContactInfoSections({ lead, onUpdate }: ContactInfoSectionsProps) {
  const { settings } = useSettings();
  const isGerman = settings?.language !== "en";

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return format(new Date(date), "PP", { locale: isGerman ? de : undefined });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Contact2 className="h-5 w-5" />
            {isGerman ? "Grundlegende Informationen" : "Basic Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Vorname" : "First Name"}
              </label>
              <div>{lead.first_name || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Nachname" : "Last Name"}
              </label>
              <div>{lead.last_name || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Position" : "Position"}
              </label>
              <div>{lead.position || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Firma" : "Company"}
              </label>
              <div>{lead.company_name || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            {isGerman ? "Kontaktdetails" : "Contact Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Telefon" : "Phone"}
              </label>
              <div>{lead.phone_number || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "E-Mail" : "Email"}
              </label>
              <div>{lead.email || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Bevorzugter Kanal" : "Preferred Channel"}
              </label>
              <div>{lead.preferred_communication_channel || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Beste Erreichbarkeit" : "Best Contact Times"}
              </label>
              <div>{lead.best_contact_times || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            {isGerman ? "Standort" : "Location"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Stadt" : "City"}
              </label>
              <div>{lead.city || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Region" : "Region"}
              </label>
              <div>{lead.region || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Adresse" : "Address"}
              </label>
              <div>{lead.address || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {isGerman ? "Persönliche Informationen" : "Personal Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Geburtsdatum" : "Birth Date"}
              </label>
              <div>{lead.birth_date ? formatDate(lead.birth_date) : "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Geschlecht" : "Gender"}
              </label>
              <div>{lead.gender || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests & Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            {isGerman ? "Interessen & Ziele" : "Interests & Goals"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Interessen" : "Interests"}
              </label>
              <div>{lead.interests?.join(", ") || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Ziele" : "Goals"}
              </label>
              <div>{lead.goals?.join(", ") || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Herausforderungen" : "Challenges"}
              </label>
              <div>{lead.challenges?.join(", ") || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5" />
            {isGerman ? "KI-Erkenntnisse" : "AI Insights"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Emotionale Analyse" : "Emotional Analysis"}
              </label>
              <div>{JSON.stringify(lead.emotional_analysis) || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Interaktionsvorhersage" : "Interaction Prediction"}
              </label>
              <div>{JSON.stringify(lead.interaction_prediction) || "-"}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {isGerman ? "Nächste Schritte" : "Next Steps"}
              </label>
              <div>{JSON.stringify(lead.next_steps) || "-"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}