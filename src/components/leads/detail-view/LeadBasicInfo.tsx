import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";

interface LeadBasicInfoProps {
  lead: Tables<"leads">;
}

export function LeadBasicInfo({ lead }: LeadBasicInfoProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: lead.name,
    platform: lead.platform,
    industry: lead.industry,
    phase: lead.phase,
    last_action: lead.last_action || "",
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("leads")
        .update(formData)
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: settings?.language === "en" ? "Success" : "Erfolg",
        description: settings?.language === "en" ? "Contact updated successfully" : "Kontakt erfolgreich aktualisiert",
      });

      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Failed to update contact" : "Fehler beim Aktualisieren des Kontakts",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}</CardTitle>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            {settings?.language === "en" ? "Edit" : "Bearbeiten"}
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {settings?.language === "en" ? "Name" : "Name"}
              </dt>
              <dd>{lead.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                {settings?.language === "en" ? "Platform" : "Plattform"}
              </dt>
              <dd>{lead.platform}</dd>
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
              <dd>{lead.last_action || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{settings?.language === "en" ? "Edit Contact" : "Kontakt bearbeiten"}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            {settings?.language === "en" ? "Cancel" : "Abbrechen"}
          </Button>
          <Button onClick={handleSave}>
            {settings?.language === "en" ? "Save" : "Speichern"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">{settings?.language === "en" ? "Name" : "Name"}</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{settings?.language === "en" ? "Platform" : "Plattform"}</label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{settings?.language === "en" ? "Industry" : "Branche"}</label>
            <Input
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{settings?.language === "en" ? "Phase" : "Phase"}</label>
            <Select
              value={formData.phase}
              onValueChange={(value) => setFormData({ ...formData, phase: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial_contact">{settings?.language === "en" ? "Initial Contact" : "Erstkontakt"}</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="closing">{settings?.language === "en" ? "Closing" : "Abschluss"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">{settings?.language === "en" ? "Last Action" : "Letzte Aktion"}</label>
            <Input
              value={formData.last_action}
              onChange={(e) => setFormData({ ...formData, last_action: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}