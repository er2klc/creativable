import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
  });

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
              <Select
                value={lead.platform}
                onValueChange={(value) => updateLeadMutation.mutate({ platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Instagram", "LinkedIn", "Facebook", "TikTok"].map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Industry" : "Branche"}
            </dt>
            <dd>
              <Input
                value={lead.industry}
                onChange={(e) => updateLeadMutation.mutate({ industry: e.target.value })}
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Company" : "Firma"}
            </dt>
            <dd>
              <Input
                value={lead.company_name || ""}
                onChange={(e) => updateLeadMutation.mutate({ company_name: e.target.value })}
                placeholder={settings?.language === "en" ? "Enter company name" : "Firmennamen eingeben"}
              />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              {settings?.language === "en" ? "Last Action" : "Letzte Aktion"}
            </dt>
            <dd>
              <Input
                value={lead.last_action || ""}
                onChange={(e) => updateLeadMutation.mutate({ last_action: e.target.value })}
              />
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}