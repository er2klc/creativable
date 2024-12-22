import React from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API-Key ist erforderlich"),
  superchat_api_key: z.string().min(1, "Superchat API-Key ist erforderlich"),
});

interface IntegrationSettingsProps {
  settings: Settings | null;
}

export function IntegrationSettings({ settings }: IntegrationSettingsProps) {
  const session = useSession();
  const { toast } = useToast();

  // Fetch current settings
  const { data: currentSettings, refetch } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session?.user?.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Settings | null;
    },
    enabled: !!session?.user?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai_api_key: settings?.openai_api_key || "",
      superchat_api_key: settings?.superchat_api_key || "",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        openai_api_key: settings.openai_api_key || "",
        superchat_api_key: settings.superchat_api_key || "",
      });
    }
  }, [settings, form]);

  const saveApiKey = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          [key]: value,
        });

      if (error) throw error;

      // Refetch settings to update the form
      await refetch();

      toast({
        title: "Erfolg ✨",
        description: `${key === 'openai_api_key' ? 'OpenAI' : 'Superchat'} API-Key wurde gespeichert`,
      });

      // Update OpenAI context if OpenAI API key was saved
      if (key === 'openai_api_key') {
        await updateOpenAIContext();
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      toast({
        title: "Fehler ❌",
        description: `API-Key konnte nicht gespeichert werden`,
        variant: "destructive",
      });
    }
  };

  const updateOpenAIContext = async () => {
    try {
      const response = await fetch('/api/update-openai-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: settings?.company_name,
          products_services: settings?.products_services,
          target_audience: settings?.target_audience,
          usp: settings?.usp,
          business_description: settings?.business_description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update OpenAI context');
      }
    } catch (error) {
      console.error('Error updating OpenAI context:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drittanbieter-Integrationen</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre API-Keys für verschiedene Integrationen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="openai_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API-Key 🤖</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="sk-..." 
                        {...field} 
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveApiKey('openai_api_key', field.value)}
                    >
                      Speichern
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="superchat_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Superchat API-Key 💬</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="sc-..." 
                        {...field} 
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveApiKey('superchat_api_key', field.value)}
                    >
                      Speichern
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}