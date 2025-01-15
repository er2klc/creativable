import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { UserInfoFields } from "./form-fields/UserInfoFields";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, type FormData } from "./schemas/settings-schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export function GeneralSettings() {
  const { user } = useAuth();
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { settings, refetchSettings } = useSettings();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      language: "Deutsch",
    },
  });

  useEffect(() => {
    if (settings && user) {
      form.reset({
        displayName: user.user_metadata?.display_name || "",
        email: user.email || "",
        phoneNumber: settings.whatsapp_number || "",
        language: settings.language || "Deutsch",
      });
      
      const userAvatarUrl = user.user_metadata?.avatar_url;
      if (userAvatarUrl) {
        setAvatarUrl(userAvatarUrl);
      }
    }
  }, [settings, user, form]);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user?.user_metadata?.avatar_url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabaseClient.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

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

  const onSubmit = async (values: FormData) => {
    try {
      // Update user metadata with display name
      const { error: userUpdateError } = await supabaseClient.auth.updateUser({
        data: { display_name: values.displayName }
      });

      if (userUpdateError) throw userUpdateError;

      // Update profiles table with display name
      const { error: profileUpdateError } = await supabaseClient
        .from('profiles')
        .update({ display_name: values.displayName })
        .eq('id', user?.id);

      if (profileUpdateError) throw profileUpdateError;

      // Update settings table for whatsapp number and language
      const { error: settingsError } = await supabaseClient
        .from("settings")
        .update({
          whatsapp_number: values.phoneNumber,
          language: values.language,
        })
        .eq("user_id", user?.id);

      if (settingsError) throw settingsError;

      toast({
        title: "Erfolg",
        description: "Profil wurde erfolgreich aktualisiert.",
      });

      await refetchSettings();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Profil konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-20 w-20 ring-2 ring-offset-2 ring-offset-background ring-[#ea384c] transition-all duration-300">
                  <AvatarImage 
                    src={avatarUrl || "/placeholder.svg"} 
                    alt="Profile" 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-background text-foreground">
                    {user?.email?.charAt(0)?.toUpperCase() || "U"}
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

            <UserInfoFields form={form} />

            <div className="flex justify-between items-center pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </Button>
              <DeleteAccountButton />
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}