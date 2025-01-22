import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";

interface CreateInstagramContactDialogProps {
  open: boolean;
  onClose: () => void;
  pipelineId?: string | null;
}

interface FormData {
  username: string;
}

export const CreateInstagramContactDialog = ({ open, onClose, pipelineId }: CreateInstagramContactDialogProps) => {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get the first pipeline and its first phase if no pipeline specified
      const { data: pipelines, error: pipelineError } = await supabase
        .from('pipelines')
        .select('id, pipeline_phases(id)')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (pipelineError) throw pipelineError;

      // Call the scan-social-profile function
      const { data: profileData, error: scanError } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          username: data.username,
          platform: 'instagram'
        }
      });

      if (scanError) throw scanError;

      // Create the lead
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: profileData.fullName || data.username,
          platform: 'instagram',
          social_media_username: data.username,
          social_media_bio: profileData.biography,
          social_media_followers: profileData.followersCount,
          social_media_following: profileData.followsCount,
          social_media_profile_image_url: profileData.profilePicUrlHD || profileData.profilePicUrl,
          social_media_posts_count: profileData.postsCount,
          industry: "Not Specified",
          pipeline_id: pipelineId || pipelines.id,
          phase_id: pipelines.pipeline_phases[0].id,
          social_media_stats: {
            followers: profileData.followersCount,
            following: profileData.followsCount,
            posts: profileData.postsCount,
            engagement_rate: profileData.engagementRate
          }
        });

      if (insertError) throw insertError;

      toast.success(
        settings?.language === "en" 
          ? "Contact created successfully" 
          : "Kontakt erfolgreich erstellt"
      );
      onClose();
    } catch (error: any) {
      console.error("Error adding Instagram contact:", error);
      toast.error(
        settings?.language === "en"
          ? "Error creating contact"
          : "Fehler beim Erstellen des Kontakts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" 
              ? "Add Instagram Contact" 
              : "Instagram Kontakt hinzufügen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="username">
              {settings?.language === "en" ? "Username" : "Benutzername"}
            </Label>
            <Input
              id="username"
              {...register("username", { required: true })}
              placeholder={settings?.language === "en" ? "Enter username" : "Benutzername eingeben"}
            />
            {errors.username && (
              <span className="text-sm text-red-500">
                {settings?.language === "en" 
                  ? "Username is required" 
                  : "Benutzername ist erforderlich"}
              </span>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (settings?.language === "en" ? "Creating..." : "Erstelle...") 
                : (settings?.language === "en" ? "Create" : "Erstellen")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};