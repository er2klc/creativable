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

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${teamId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', teamId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success("Team Logo erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating team logo:", error);
      toast.error("Fehler beim Aktualisieren des Team Logos");
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