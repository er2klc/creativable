import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

      const scope = [
        'instagram_basic',
        'instagram_content_publish',
        'instagram_manage_comments',
        'instagram_manage_insights',
        'pages_show_list',
        'pages_read_engagement',
        'business_management'
      ].join(',');

      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);

      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        scope: scope,
        response_type: 'code',
        state: state
      });

      window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
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
        <AlertTitle>Einrichtungsanleitung</AlertTitle>
        <AlertDescription>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="step1">
              <AccordionTrigger>1. Meta Business Account einrichten</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Gehen Sie zu <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">business.facebook.com</a></li>
                  <li>Erstellen Sie einen Business Account falls noch nicht vorhanden</li>
                  <li>Fügen Sie Ihre Instagram Professional Account hinzu</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step2">
              <AccordionTrigger>2. Meta Developer App erstellen</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Gehen Sie zu <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com/apps</a></li>
                  <li>Klicken Sie auf "App erstellen"</li>
                  <li>Wählen Sie "Business" als App-Typ</li>
                  <li>Füllen Sie die erforderlichen Details aus</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step3">
              <AccordionTrigger>3. App konfigurieren</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Fügen Sie das Produkt "Facebook Login" hinzu</li>
                  <li>Unter "Facebook Login" > "Einstellungen":</li>
                  <li className="ml-4">Aktivieren Sie "Client OAuth Login"</li>
                  <li className="ml-4">Aktivieren Sie "Web OAuth Login"</li>
                  <li className="ml-4">Fügen Sie diese URIs hinzu:</li>
                  <div className="bg-muted p-3 rounded-md space-y-2 text-sm mt-2">
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
                  <li>Unter "App-Einstellungen" > "Grundlegendes":</li>
                  <li className="ml-4">App-ID und App-Geheimnis kopieren</li>
                  <li className="ml-4">App-Domäne hinzufügen: <code>{window.location.host}</code></li>
                  <li className="ml-4">Website-URL hinzufügen: <code>{window.location.origin}</code></li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step4">
              <AccordionTrigger>4. Berechtigungen konfigurieren</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Unter "App-Überprüfung" > "Berechtigungen und Funktionen":</li>
                  <li>Folgende Berechtigungen hinzufügen:</li>
                  <ul className="list-disc ml-4 mt-2">
                    <li>instagram_basic</li>
                    <li>instagram_content_publish</li>
                    <li>instagram_manage_comments</li>
                    <li>instagram_manage_insights</li>
                    <li>pages_show_list</li>
                    <li>pages_read_engagement</li>
                    <li>business_management</li>
                  </ul>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-4">
            <a 
              href="https://developers.facebook.com/apps/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary flex items-center hover:underline"
            >
              Zur Meta Developers Console
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
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