import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TeamLogoUploadProps {
  teamId: string;
  currentLogoUrl?: string | null;
}

export const TeamLogoUpload = ({ teamId, currentLogoUrl }: TeamLogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Bitte laden Sie nur Bilder hoch");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Die Datei ist zu groß (maximal 5MB)");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Logo wird hochgeladen...");

      const fileExt = file.name.split('.').pop();
      const filePath = `${teamId}/logo.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('team-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Fehler beim Hochladen des Logos");
      }

      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', teamId);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Fehler beim Aktualisieren des Team Logos");
      }

      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.dismiss();
      toast.success("Team Logo erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating team logo:", error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Fehler beim Aktualisieren des Team Logos");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="cursor-pointer">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={isUploading}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isUploading}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>
        </label>
      </TooltipTrigger>
      <TooltipContent>
        {currentLogoUrl ? "Logo ändern" : "Logo hochladen"}
      </TooltipContent>
    </Tooltip>
  );
};