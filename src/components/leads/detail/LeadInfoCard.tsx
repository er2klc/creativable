import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { ContactDetailsFields } from "./contact-info/ContactDetailsFields";
import { AddressFields } from "./contact-info/AddressFields";
import { AdditionalInfoFields } from "./contact-info/AdditionalInfoFields";
import { InterestsGoalsFields } from "./contact-info/InterestsGoalsFields";
import { SourceInfoFields } from "./contact-info/SourceInfoFields";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LeadCardHeader } from "./card/LeadCardHeader";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { leadId } = useParams();
  const navigate = useNavigate();

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
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      // Delete all related data first
      const deleteRelatedData = async () => {
        await supabase.from("messages").delete().eq("lead_id", lead.id);
        await supabase.from("tasks").delete().eq("lead_id", lead.id);
        await supabase.from("notes").delete().eq("lead_id", lead.id);
        await supabase.from("lead_files").delete().eq("lead_id", lead.id);
      };

      await deleteRelatedData();

      // Then delete the lead
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      navigate("/pool");
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    },
  });

  const handleUpdate = (updates: Partial<Tables<"leads">>, showToast = false) => {
    updateLeadMutation.mutate(updates);
    if (showToast) {
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 border-b border-gray-200/30 shadow-sm">
        <LeadCardHeader lead={lead} />
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInformationFields lead={lead} onUpdate={handleUpdate} />
        <div className="h-px bg-gray-200/80" />
        <ContactDetailsFields lead={lead} onUpdate={handleUpdate} />
        <div className="h-px bg-gray-200/80" />
        <AddressFields lead={lead} onUpdate={handleUpdate} />
        <div className="h-px bg-gray-200/80" />
        <AdditionalInfoFields lead={lead} onUpdate={handleUpdate} />
        <div className="h-px bg-gray-200/80" />
        <InterestsGoalsFields lead={lead} onUpdate={handleUpdate} />
        <div className="h-px bg-gray-200/80" />
        <SourceInfoFields lead={lead} onUpdate={handleUpdate} showToast={true} />
        <div className="h-px bg-gray-200/80" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {settings?.language === "en" ? "Delete Contact" : "Kontakt löschen"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {settings?.language === "en" ? "Delete Contact" : "Kontakt löschen"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {settings?.language === "en" 
                  ? "This will permanently delete the contact and all related data. This action cannot be undone."
                  : "Dies wird den Kontakt und alle zugehörigen Daten dauerhaft löschen. Diese Aktion kann nicht rückgängig gemacht werden."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {settings?.language === "en" ? "Cancel" : "Abbrechen"}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteLeadMutation.mutate()}
                className="bg-destructive hover:bg-destructive/90"
              >
                {settings?.language === "en" ? "Delete" : "Löschen"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}