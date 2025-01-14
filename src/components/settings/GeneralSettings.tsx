import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { UserInfoFields } from "./form-fields/UserInfoFields";

export function GeneralSettings() {
  const { session } = useAuth();
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { settings, refetchSettings } = useSettings();

  useEffect(() => {
    if (settings?.avatar_url) {
      setAvatarUrl(settings.avatar_url);
    }
  }, [settings?.avatar_url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${session?.user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", session?.user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(data.publicUrl);
      await refetchSettings();

      toast({
        title: "Erfolg",
        description: "Avatar wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Avatar konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      if (e.target instanceof HTMLInputElement) {
        uploadAvatar(e as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profil</h3>
        <p className="text-sm text-muted-foreground">
          Verwalten Sie hier Ihre Profilinformationen.
        </p>
      </div>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-20 w-20 ring-2 ring-offset-2 ring-offset-background transition-all duration-300 bg-gradient-to-r from-[#F97316] via-[#0EA5E9] to-[#ea384c]">
                <AvatarImage 
                  src={avatarUrl || "/placeholder.svg"} 
                  alt="Profile" 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-r from-[#F97316] via-[#0EA5E9] to-[#ea384c] text-white">
                  {session?.user?.user_metadata?.display_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-black/60 flex items-center justify-center text-white text-sm transition-opacity">
                Ändern
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Profilbild</h4>
              <p className="text-sm text-muted-foreground">
                Klicken Sie auf das Bild, um es zu ändern
              </p>
              {uploading && <p className="text-sm text-muted-foreground">Wird hochgeladen...</p>}
            </div>
          </div>

          <UserInfoFields />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-4">Konto löschen</h4>
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}