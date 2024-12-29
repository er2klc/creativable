import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamLogoUploadProps {
  teamId: string;
  currentLogoUrl?: string;
}

export const TeamLogoUpload = ({
  teamId,
  currentLogoUrl,
}: TeamLogoUploadProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl || null);
  const { toast } = useToast();

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${teamId}-logo.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      // Update team record
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: publicUrl })
        .eq('id', teamId);

      if (updateError) throw updateError;

      toast({
        title: "Logo updated",
        description: "Your team logo has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "There was an error uploading your logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onLogoRemove = async () => {
    try {
      // Update team record to remove logo
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: null })
        .eq('id', teamId);

      if (updateError) throw updateError;

      setLogoPreview(null);
      toast({
        title: "Logo removed",
        description: "Your team logo has been removed successfully.",
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: "There was an error removing your logo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Team Logo</Label>
      <div className="flex flex-col items-center gap-4">
        {logoPreview ? (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
            <img
              src={logoPreview}
              alt="Team logo preview"
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 bg-background/80 hover:bg-background"
              onClick={onLogoRemove}
            >
              ×
            </Button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
            <Image className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="flex justify-center">
          <Label
            htmlFor="logo-upload"
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Logo hochladen
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onLogoChange}
            />
          </Label>
        </div>
      </div>
    </div>
  );
};