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

const formSchema = z.object({
  openai_api_key: z.string().min(1, "OpenAI API-Key ist erforderlich"),
  superchat_api_key: z.string().min(1, "Superchat API-Key ist erforderlich"),
});

export function IntegrationSettings({ settings }: { settings: Settings | null }) {
  const session = useSession();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openai_api_key: settings?.openai_api_key || "",
      superchat_api_key: settings?.superchat_api_key || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          openai_api_key: values.openai_api_key,
          superchat_api_key: values.superchat_api_key,
        });

      if (error) throw error;

      toast({
        title: "Erfolg ✨",
        description: "API-Keys wurden gespeichert",
      });
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast({
        title: "Fehler ❌",
        description: "API-Keys konnten nicht gespeichert werden",
        variant: "destructive",
      });
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="openai_api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API-Key 🤖</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="sk-..." {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="password" placeholder="sc-..." {...field} />
                  </FormControl>
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