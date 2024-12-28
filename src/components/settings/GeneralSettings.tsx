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
import { User, Globe2 } from "lucide-react";

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
            console.warn("Phone number update failed:", phoneError);
            toast({
              title: "Hinweis",
              description: "Handynummer konnte nicht gespeichert werden. Andere Änderungen wurden gespeichert.",
              variant: "default"
            });
            return;
          }
        } catch (phoneError) {
          console.error("Phone update error:", phoneError);
          toast({
            title: "Hinweis",
            description: "Handynummer konnte nicht gespeichert werden. Andere Änderungen wurden gespeichert.",
            variant: "default"
          });
          return;
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
            <div className="relative">
              <User className="absolute left-0 top-8 h-5 w-5 text-gray-500" />
              <Globe2 className="absolute right-4 top-[4.5rem] h-5 w-5 text-blue-500" />
              <div className="pl-8">
                <UserInfoFields form={form} />
              </div>
            </div>
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