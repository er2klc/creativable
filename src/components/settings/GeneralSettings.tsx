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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function GeneralSettings() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  // Fetch current settings and user data
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
      name: session?.user?.user_metadata?.full_name || "",
      phoneNumber: formatPhoneNumber(session?.user?.phone || ""),
      email: session?.user?.email || "",
      displayName: session?.user?.user_metadata?.display_name || "",
    },
  });

  React.useEffect(() => {
    if (settings?.language || session?.user) {
      form.reset({
        language: settings?.language || "Deutsch",
        name: session?.user?.user_metadata?.full_name || "",
        phoneNumber: formatPhoneNumber(session?.user?.phone || ""),
        email: session?.user?.email || "",
        displayName: session?.user?.user_metadata?.display_name || "",
      });
    }
  }, [settings, session?.user, form]);

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

      // Format phone number to E.164 format if provided
      const formattedPhone = values.phoneNumber ? formatPhoneNumber(values.phoneNumber) : null;

      // Update settings
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert(
          {
            user_id: session.user.id,
            language: values.language,
            updated_at: new Date().toISOString(),
          },
          { 
            onConflict: 'user_id'
          }
        );

      if (settingsError) throw settingsError;

      // Update user metadata and profile
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          full_name: values.name,
          display_name: values.displayName
        }
      });

      if (metadataError) throw metadataError;

      // Update profile display_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: values.displayName })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Only try to update phone if it's provided and different
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

      // Invalidate and refetch settings
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
          <Label>Profilbild</Label>
          <div className="flex items-center gap-4 mt-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || "/placeholder.svg"} />
              <AvatarFallback>
                {session?.user?.user_metadata?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="max-w-[200px]"
            />
          </div>
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