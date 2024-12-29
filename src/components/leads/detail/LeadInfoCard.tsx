import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Contact2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactInfoFields } from "./contact-info/ContactInfoFields";
import { SocialMediaFields } from "./social-media/SocialMediaFields";
import { BioAndInterestsFields } from "./bio/BioAndInterestsFields";

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
        <CardTitle className="flex items-center gap-2 antialiased">
          <Contact2 className="h-5 w-5 text-gray-900" />
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <SocialMediaFields 
            lead={lead} 
            onUpdate={updateLeadMutation.mutate} 
          />
          <ContactInfoFields 
            lead={lead} 
            onUpdate={updateLeadMutation.mutate} 
          />
          <BioAndInterestsFields 
            lead={lead} 
            onUpdate={updateLeadMutation.mutate} 
          />
        </dl>
      </CardContent>
    </Card>
  );
}