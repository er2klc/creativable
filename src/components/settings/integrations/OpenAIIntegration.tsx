import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API-Key ist erforderlich"),
});

export function OpenAIIntegration() {
  const { settings, updateSettings } = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai_api_key: settings?.openai_api_key || "",
    },
  });

  // Update form values when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        openai_api_key: settings.openai_api_key || "",
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

  const saveApiKey = async (value: string) => {
    await updateSettings('openai_api_key', value);
    await updateOpenAIContext();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">OpenAI Integration 🤖</h3>
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
                  <Button 
                    type="button"
                    onClick={() => saveApiKey(field.value)}
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
    </div>
  );
}