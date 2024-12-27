import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Settings } from "@/integrations/supabase/types/settings";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  language: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  email: z.string().email(),
});

const languages = [
  { value: "Deutsch", label: "🇩🇪 Deutsch" },
  { value: "English", label: "🇬🇧 English" },
  { value: "Français", label: "🇫🇷 Français" },
  { value: "Español", label: "🇪🇸 Español" },
  { value: "Italiano", label: "🇮🇹 Italiano" },
  { value: "Türkçe", label: "🇹🇷 Türkçe" },
];

export function GeneralSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const supabaseClient = useSupabaseClient();

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
      phoneNumber: session?.user?.phone || "",
      email: session?.user?.email || "",
    },
  });

  React.useEffect(() => {
    if (settings?.language || session?.user) {
      form.reset({
        language: settings?.language || "Deutsch",
        name: session?.user?.user_metadata?.full_name || "",
        phoneNumber: session?.user?.phone || "",
        email: session?.user?.email || "",
      });
    }
  }, [settings, session?.user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Saving settings:", values);
      
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

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
            onConflict: 'user_id',
            ignoreDuplicates: false 
          }
        );

      if (settingsError) throw settingsError;

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: values.name },
        phone: values.phoneNumber,
      });

      if (userError) throw userError;

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

  const handleDeleteAccount = async () => {
    try {
      if (!session?.user?.id) {
        throw new Error("No user session found");
      }

      // Delete user data from all tables
      const tables = ['settings', 'leads', 'messages', 'notes', 'tasks', 'documents', 'keywords', 'message_templates', 'platform_auth_status', 'lead_phases'];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        }
      }

      // Delete the user account
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
        session.user.id
      );

      if (deleteError) throw deleteError;

      // Sign out the user
      await supabaseClient.auth.signOut();
      
      toast({
        title: "Konto gelöscht",
        description: "Ihr Konto wurde erfolgreich gelöscht.",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Fehler beim Löschen",
        description: "Konto konnte nicht gelöscht werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Allgemeine Einstellungen</CardTitle>
            <CardDescription>
              Verwalten Sie hier Ihre persönlichen Daten und Spracheinstellungen.
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Konto löschen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Ihr Konto und alle damit verbundenen Daten werden permanent gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Konto löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonnummer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hauptsprache 🌍</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Sprache" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Speichern</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}