import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "@/integrations/supabase/types/settings";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { UserInfoFields } from "./form-fields/UserInfoFields";
import { formSchema, formatPhoneNumber } from "./schemas/settings-schema";
import type { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function GeneralSettings() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (profileError) throw profileError;

      if (profileData?.avatar_url) {
        setAvatarUrl(profileData.avatar_url);
      }

      return settingsData as Settings | null;
    },
    enabled: !!session?.user?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: settings?.language || "Deutsch",
      phoneNumber: formatPhoneNumber(session?.user?.phone || ""),
      email: session?.user?.email || "",
      displayName: session?.user?.user_metadata?.display_name || "",
    },
  });

  React.useEffect(() => {
    if (settings?.language || session?.user) {
      form.reset({
        language: settings?.language || "Deutsch",
        phoneNumber: formatPhoneNumber(session?.user?.phone || ""),
        email: session?.user?.email || "",
        displayName: session?.user?.user_metadata?.display_name || "",
      });
    }
  }, [settings, session?.user, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session?.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success("Avatar erfolgreich aktualisiert");
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || "Fehler beim Hochladen des Avatars");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      const formattedPhone = values.phoneNumber ? formatPhoneNumber(values.phoneNumber) : null;

      const { error: settingsError } = await supabase
        .from("settings")
        .upsert(
          {
            user_id: session.user.id,
            language: values.language,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (settingsError) throw settingsError;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          display_name: values.displayName
        }
      });

      if (metadataError) throw metadataError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: values.displayName })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      if (formattedPhone && formattedPhone !== session.user.phone) {
        const { error: phoneError } = await supabase.auth.updateUser({
          phone: formattedPhone
        });

        if (phoneError) {
          console.error("Phone update error:", phoneError);
          toast.error("Handynummer konnte nicht gespeichert werden. Bitte überprüfen Sie das Format (+491234567890).");
          return;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });

      toast.success("Einstellungen wurden gespeichert");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Einstellungen konnten nicht gespeichert werden");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allgemeine Einstellungen</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre persönlichen Daten und Spracheinstellungen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-20 w-20 ring-2 ring-offset-2 ring-offset-background transition-all duration-300 bg-gradient-to-r from-[#F97316] via-[#0EA5E9] to-[#ea384c]">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  {session?.user?.user_metadata?.display_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-full flex items-center justify-center">
                <Camera className="text-white opacity-0 group-hover:opacity-100 h-6 w-6" />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-medium">{form.getValues("displayName")}</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <UserInfoFields form={form} />
            <div className="flex justify-between items-center pt-4">
              <Button type="submit">Speichern</Button>
              <DeleteAccountButton />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}