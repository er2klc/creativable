import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { Contact2 } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { ContactInfoSections } from "./contact-info/ContactInfoSections";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();

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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Contact2 className="h-5 w-5" />
          {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ContactInfoSections 
          lead={lead} 
          onUpdate={updateLeadMutation.mutate}
        />
      </CardContent>
    </Card>
  );
}