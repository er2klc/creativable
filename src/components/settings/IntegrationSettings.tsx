import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

const formSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API-Key ist erforderlich"),
  instagram_app_id: z.string().min(1, "Instagram App ID ist erforderlich"),
  instagram_app_secret: z.string().min(1, "Instagram App Secret ist erforderlich"),
});

export function IntegrationSettings() {
  const { settings, updateSettings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai_api_key: settings?.openai_api_key || "",
      instagram_app_id: "",
      instagram_app_secret: "",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        openai_api_key: settings.openai_api_key || "",
        instagram_app_id: "",
        instagram_app_secret: "",
      });
    }
  }, [settings, form]);

  const saveApiKey = async (key: string, value: string) => {
    await updateSettings(key, value);

    // Update OpenAI context if OpenAI API key was saved
    if (key === 'openai_api_key') {
      await updateOpenAIContext();
    }
  };

  const updateOpenAIContext = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-openai-context', {
        body: JSON.stringify({
          company_name: settings?.company_name,
          products_services: settings?.products_services,
          target_audience: settings?.target_audience,
          usp: settings?.usp,
          business_description: settings?.business_description,
        }),
      });

      if (error) throw error;
      console.log('OpenAI context updated:', data);
    } catch (error) {
      console.error('Error updating OpenAI context:', error);
    }
  };

  const connectInstagram = async () => {
    const appId = form.getValues("instagram_app_id");
    const appSecret = form.getValues("instagram_app_secret");
    
    // Speichern der App-Credentials
    await updateSettings("instagram_app_id", appId);
    await updateSettings("instagram_app_secret", appSecret);

    // Redirect zur Instagram OAuth URL
    const redirectUri = `${window.location.origin}/auth/callback/instagram`;
    const scope = "instagram_basic,instagram_manage_messages";
    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = instagramAuthUrl;
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
          <form className="space-y-6">
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Instagram Integration 📸</h3>
              <Alert>
                <AlertDescription>
                  Um Instagram Direct Messages zu senden, benötigen Sie:
                  <ul className="list-disc pl-4 mt-2">
                    <li>Einen Meta Business Account</li>
                    <li>Einen Instagram Professional Account</li>
                    <li>Eine Meta Developer App mit den richtigen Berechtigungen</li>
                  </ul>
                  <div className="mt-2">
                    <a 
                      href="https://developers.facebook.com/docs/instagram-api/getting-started" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary flex items-center hover:underline"
                    >
                      Zur Meta Developers Dokumentation
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="instagram_app_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram App ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123456789..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_app_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram App Secret</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="abc123..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="button"
                onClick={connectInstagram}
                className="w-full"
              >
                Mit Instagram verbinden
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}