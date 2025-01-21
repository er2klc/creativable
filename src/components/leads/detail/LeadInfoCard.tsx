import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact2, Trash2, Scan } from "lucide-react";
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
import { useState } from "react";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

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

  const scanProfile = async () => {
    if (!lead.social_media_username || lead.platform !== "Instagram") return;

    setIsScanning(true);
    try {
      const response = await fetch('/api/scan-social-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          platform: lead.platform,
          username: lead.social_media_username
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan profile');
      }

      const { data } = await response.json();
      
      if (data) {
        await updateLeadMutation.mutateAsync({
          social_media_bio: data.bio,
          instagram_followers: data.followers,
          instagram_following: data.following,
          instagram_posts: data.posts,
          instagram_engagement_rate: data.engagement_rate,
          instagram_profile_image_url: data.profileImageUrl,
          last_social_media_scan: new Date().toISOString()
        });
        toast.success("Profil erfolgreich gescannt");
      }
    } catch (error) {
      console.error("Error scanning profile:", error);
      toast.error("Fehler beim Scannen des Profils");
    } finally {
      setIsScanning(false);
    }
  };

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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Contact2 className="h-5 w-5" />
            {settings?.language === "en" ? "Contact Information" : "Kontakt Informationen"}
          </CardTitle>
          {lead.platform === "Instagram" && (
            <Button
              variant="outline"
              size="sm"
              onClick={scanProfile}
              disabled={isScanning || !lead.social_media_username}
              className="mr-2"
            >
              {isScanning ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2">
                    <Scan className="h-4 w-4" />
                  </div>
                  Scanning...
                </div>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Profil scannen
                </>
              )}
            </Button>
          )}
        </div>
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
