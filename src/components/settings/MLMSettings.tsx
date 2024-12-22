import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";

const formSchema = z.object({
  company_name: z.string().min(1, "Firmenname ist erforderlich"),
  products_services: z.string().min(1, "Produkte/Dienstleistungen sind erforderlich"),
  target_audience: z.string().min(1, "Zielgruppe ist erforderlich"),
  usp: z.string().min(1, "USP ist erforderlich"),
  business_description: z.string().min(1, "Geschäftsbeschreibung ist erforderlich"),
});

export function MLMSettings({ settings }: { settings: Settings | null }) {
  const session = useSession();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: settings?.company_name || "",
      products_services: settings?.products_services || "",
      target_audience: settings?.target_audience || "",
      usp: settings?.usp || "",
      business_description: settings?.business_description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          ...values,
        });

      if (error) throw error;

      toast({
        title: "Erfolg ✨",
        description: "MLM-Informationen wurden gespeichert",
      });

      // Trigger OpenAI context update
      await updateOpenAIContext(values);
    } catch (error) {
      console.error("Error saving MLM settings:", error);
      toast({
        title: "Fehler ❌",
        description: "MLM-Informationen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const updateOpenAIContext = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/update-openai-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update OpenAI context');
      }
    } catch (error) {
      console.error('Error updating OpenAI context:', error);
      // We don't show this error to the user since the data was saved successfully
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>MLM-Firmeninformationen</CardTitle>
        <CardDescription>
          Hinterlegen Sie hier Ihre Firmeninformationen für die automatische Verwendung in Nachrichten.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmenname 🏢</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Zinzino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="products_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produkte/Dienstleistungen 🛍️</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="z.B. Hochwertige Gesundheitsprodukte, Nahrungsergänzungsmittel"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zielgruppe 👥</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="z.B. Menschen, die an Fitness und Gesundheit interessiert sind"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alleinstellungsmerkmal (USP) ✨</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="z.B. Hochwertige Qualität, wissenschaftlich fundiert"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business-Beschreibung 📋</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="z.B. Wir unterstützen unsere Kunden durch erstklassige Gesundheitsprodukte und persönliches Coaching"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Alle Informationen Speichern</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}