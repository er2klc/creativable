import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "@/integrations/supabase/types/settings";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { UserInfoFields } from "./form-fields/UserInfoFields";
import { formSchema, formatPhoneNumber } from "./schemas/settings-schema";
import type { z } from "zod";

export function GeneralSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings and user data
  const { data: settings } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as Settings | null;
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
    },
  });

  React.useEffect(() => {
    if (settings?.language || session?.user) {
      form.reset({
        language: settings?.language || "Deutsch",
        name: session?.user?.user_metadata?.full_name || "",
        phoneNumber: formatPhoneNumber(session?.user?.phone || ""),
        email: session?.user?.email || "",
      });
    }
  }, [settings, session?.user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      // Format phone number to E.164 format
      const formattedPhone = formatPhoneNumber(values.phoneNumber);

      // Update settings
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert(
          {
            user_id: session.user.id,
            language: values.language,
            name: values.name, // Store name in settings table as well
            updated_at: new Date().toISOString(),
          },
          { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          }
        );

      if (settingsError) throw settingsError;

      // Update user metadata first
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { full_name: values.name }
      });

      if (metadataError) throw metadataError;

      // Only try to update phone if it's provided and different
      if (formattedPhone && formattedPhone !== session.user.phone) {
        try {
          const { error: phoneError } = await supabase.auth.updateUser({
            phone: formattedPhone
          });

          if (phoneError) {
            // If phone update fails, show warning but don't fail the whole operation
            console.warn("Phone number update failed:", phoneError);
            toast({
              title: "Hinweis",
              description: "Telefonnummer konnte nicht gespeichert werden. Andere Änderungen wurden gespeichert.",
              variant: "warning",
            });
          }
        } catch (phoneError) {
          console.warn("Phone update error:", phoneError);
          // Continue with other updates even if phone update fails
        }
      }

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });

      toast({
        title: "Erfolg ✨",
        description: "Einstellungen wurden gespeichert",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Fehler ❌",
        description: "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
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
      <CardContent className="space-y-6">
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