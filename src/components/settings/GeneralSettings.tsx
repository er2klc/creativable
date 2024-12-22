import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  language: z.string(),
});

export function GeneralSettings({ settings }: { settings: any }) {
  const session = useSession();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: settings?.language || "de",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          language: values.language,
        });

      if (error) throw error;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allgemeine Einstellungen</CardTitle>
        <CardDescription>
          Verwalten Sie hier Ihre Spracheinstellungen und andere globale Präferenzen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">Englisch</SelectItem>
                      <SelectItem value="fr">Französisch</SelectItem>
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