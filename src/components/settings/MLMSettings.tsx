import React from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  company_name: z.string().min(1, "Firmenname ist erforderlich"),
  products_services: z.string().min(1, "Produkte/Dienstleistungen sind erforderlich"),
  target_audience: z.string().min(1, "Zielgruppe ist erforderlich"),
  usp: z.string().min(1, "USP ist erforderlich"),
  business_description: z.string().min(1, "Geschäftsbeschreibung ist erforderlich"),
});

export function MLMSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings } = useQuery({
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
      company_name: settings?.company_name || "",
      products_services: settings?.products_services || "",
      target_audience: settings?.target_audience || "",
      usp: settings?.usp || "",
      business_description: settings?.business_description || "",
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        company_name: settings.company_name || "",
        products_services: settings.products_services || "",
        target_audience: settings.target_audience || "",
        usp: settings.usp || "",
        business_description: settings.business_description || "",
      });
    }
  }, [settings, form]);

  const saveField = async (field: string, value: string) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          [field]: value,
        });

      if (error) throw error;

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings", session?.user?.id] });

      toast({
        title: "Erfolg ✨",
        description: `${field} wurde gespeichert`,
      });

      // Update OpenAI context
      await updateOpenAIContext({
        ...form.getValues(),
        [field]: value
      });
    } catch (error) {
      console.error(`Error saving ${field}:`, error);
      toast({
        title: "Fehler ❌",
        description: `${field} konnte nicht gespeichert werden`,
        variant: "destructive",
      });
    }
  };

  const updateOpenAIContext = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase.functions.invoke('update-openai-context', {
        body: JSON.stringify(values),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating OpenAI context:', error);
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
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Firmenname 🏢</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="z.B. Zinzino" {...field} />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveField('company_name', field.value)}
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
              name="products_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produkte/Dienstleistungen 🛍️</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="z.B. Hochwertige Gesundheitsprodukte, Nahrungsergänzungsmittel"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveField('products_services', field.value)}
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
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zielgruppe 👥</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="z.B. Menschen, die an Fitness und Gesundheit interessiert sind"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveField('target_audience', field.value)}
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
              name="usp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alleinstellungsmerkmal (USP) ✨</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="z.B. Hochwertige Qualität, wissenschaftlich fundiert"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveField('usp', field.value)}
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
              name="business_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business-Beschreibung 📋</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="z.B. Wir unterstützen unsere Kunden durch erstklassige Gesundheitsprodukte und persönliches Coaching"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveField('business_description', field.value)}
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