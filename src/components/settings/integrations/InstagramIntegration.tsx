import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

const formSchema = z.object({
  instagram_app_id: z.string().min(1, "Instagram App ID ist erforderlich"),
  instagram_app_secret: z.string().min(1, "Instagram App Secret ist erforderlich"),
});

export function InstagramIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const redirectUri = `${window.location.origin}/auth/callback/instagram`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      instagram_app_id: settings?.instagram_app_id || "",
      instagram_app_secret: settings?.instagram_app_secret || "",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        instagram_app_id: settings.instagram_app_id || "",
        instagram_app_secret: settings.instagram_app_secret || "",
      });
    }
  }, [settings, form]);

  const connectInstagram = async () => {
    try {
      const appId = form.getValues("instagram_app_id");
      const appSecret = form.getValues("instagram_app_secret");
      
      await updateSettings("instagram_app_id", appId);
      await updateSettings("instagram_app_secret", appSecret);

      const scope = "instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,instagram_manage_messages";
      const state = crypto.randomUUID();
      
      localStorage.setItem('instagram_oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state
      });
      
      window.location.href = `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast({
        title: "Fehler bei der Instagram-Verbindung",
        description: "Bitte überprüfen Sie Ihre App-ID und App-Secret",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Instagram Integration 📸</h3>
      
      <Alert>
        <AlertDescription>
          <div className="space-y-4">
            <div>
              Für die Instagram-Integration benötigen Sie:
              <ul className="list-disc pl-4 mt-2">
                <li>Einen Meta Business Account</li>
                <li>Einen Instagram Professional Account</li>
                <li>Eine Meta Developer App mit den richtigen Berechtigungen</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Wichtige URIs für die Meta App-Einstellungen:</p>
              <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                <div>
                  <p className="font-medium">OAuth Redirect URI:</p>
                  <code className="block mt-1">{redirectUri}</code>
                </div>
                <div>
                  <p className="font-medium">Deauthorize Callback URL:</p>
                  <code className="block mt-1">{`${window.location.origin}/auth/deauthorize/instagram`}</code>
                </div>
                <div>
                  <p className="font-medium">Data Deletion Request URL:</p>
                  <code className="block mt-1">{`${window.location.origin}/auth/data-deletion/instagram`}</code>
                </div>
              </div>
            </div>

            <div>
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
          </div>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form className="space-y-4">
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
        </form>
      </Form>
    </div>
  );
}