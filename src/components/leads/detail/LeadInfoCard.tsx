import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Globe, Building2, Phone, Mail, Briefcase, Contact2, ExternalLink, UserCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { platformsConfig, generateSocialMediaUrl, type Platform } from "@/config/platforms";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [newInterest, setNewInterest] = useState("");

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

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    const currentInterests = lead.social_media_interests || [];
    if (!currentInterests.includes(newInterest)) {
      updateLeadMutation.mutate({
        social_media_interests: [...currentInterests, newInterest]
      });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    const currentInterests = lead.social_media_interests || [];
    updateLeadMutation.mutate({
      social_media_interests: currentInterests.filter(i => i !== interest)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 antialiased">
          <Contact2 className="h-5 w-5" />
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Globe className="h-4 w-4" />
              {settings?.language === "en" ? "Platform" : "Plattform"}
            </dt>
            <dd className="flex items-center gap-2">
              <Select
                value={lead.platform as Platform}
                onValueChange={(value: Platform) => updateLeadMutation.mutate({ platform: value })}
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
              <Contact2 className="h-4 w-4" />
              {settings?.language === "en" ? "Social Media Username" : "Social Media Benutzername"}
            </dt>
            <dd className="flex items-center gap-2">
              <Input
                value={lead.social_media_username || ""}
                onChange={(e) => updateLeadMutation.mutate({ social_media_username: e.target.value })}
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
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Phone className="h-4 w-4 text-gray-900" />
              {settings?.language === "en" ? "Phone Number" : "Telefonnummer"}
            </dt>
            <dd>
              <Input
                value={lead.phone_number || ""}
                onChange={(e) => updateLeadMutation.mutate({ phone_number: e.target.value })}
                placeholder={settings?.language === "en" ? "Enter phone number" : "Telefonnummer eingeben"}
                type="tel"
              />
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-4 w-4 text-gray-900" />
              {settings?.language === "en" ? "Email" : "E-Mail"}
            </dt>
            <dd>
              <Input
                value={lead.email || ""}
                onChange={(e) => updateLeadMutation.mutate({ email: e.target.value })}
                placeholder={settings?.language === "en" ? "Enter email" : "E-Mail eingeben"}
                type="email"
              />
            </dd>
          </div>

          <div className="col-span-2">
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 antialiased">
              <UserCircle className="h-4 w-4" />
              Bio
            </dt>
            <dd>
              <Textarea
                value={lead.social_media_bio || ""}
                onChange={(e) => updateLeadMutation.mutate({ social_media_bio: e.target.value })}
                placeholder={settings?.language === "en" ? "Enter bio" : "Bio eingeben"}
                className="min-h-[150px] antialiased"
              />
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2 antialiased">
              <UserCircle className="h-4 w-4" />
              {settings?.language === "en" ? "Interests/Skills/Positives" : "Interessen/Skills/Positives"}
            </dt>
            <dd className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder={settings?.language === "en" ? "Add new interest/skill" : "Neue Interesse/Skill hinzufügen"}
                  className="antialiased"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                />
                <Button 
                  onClick={handleAddInterest}
                  type="button"
                  className="antialiased"
                >
                  {settings?.language === "en" ? "Add" : "Hinzufügen"}
                </Button>
              </div>
              <ScrollArea className="h-24 w-full rounded-md border">
                <div className="p-4 flex flex-wrap gap-2">
                  {(lead.social_media_interests || []).map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 antialiased"
                    >
                      {interest}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveInterest(interest)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
