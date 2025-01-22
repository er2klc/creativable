import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Scan } from "lucide-react";

const formSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API-Key ist erforderlich"),
  apify_api_key: z.string().min(1, "Apify API-Key ist erforderlich"),
});

export function OpenAIIntegration() {
  const { settings, updateSettings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai_api_key: settings?.openai_api_key || "",
      apify_api_key: settings?.apify_api_key || "",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        openai_api_key: settings.openai_api_key || "",
        apify_api_key: settings.apify_api_key || "",
      });
    }
  }, [settings, form]);

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

  const saveApiKeys = async (values: z.infer<typeof formSchema>) => {
    await updateSettings.mutateAsync({
      openai_api_key: values.openai_api_key,
      apify_api_key: values.apify_api_key,
    });
    await updateOpenAIContext();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <h3 className="text-lg font-medium">OpenAI Integration 🤖</h3>
        </div>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="openai_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API-Key</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="sk-..." 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scan className="h-6 w-6" />
          <h3 className="text-lg font-medium">Apify Integration 🔍</h3>
        </div>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(saveApiKeys)}>
            <FormField
              control={form.control}
              name="apify_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apify API-Key</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="apify_api_..." 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              API-Keys Speichern
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}