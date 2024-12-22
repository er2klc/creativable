import { useSession } from "@supabase/auth-helpers-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";

const formSchema = z.object({
  about_me: z.string().min(1, "Über mich Text ist erforderlich"),
});

export function AboutSettings({ settings }: { settings: Settings | null }) {
  const session = useSession();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      about_me: settings?.about_me || "",
    },
  });

  const saveAboutMe = async (value: string) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: session?.user?.id,
          about_me: value,
        });

      if (error) throw error;

      toast({
        title: "Erfolg ✨",
        description: "Über mich wurde gespeichert",
      });
    } catch (error) {
      console.error("Error saving about me:", error);
      toast({
        title: "Fehler ❌",
        description: "Über mich konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Über mich</CardTitle>
        <CardDescription>
          Beschreiben Sie sich und Ihre Erfahrung im Network Marketing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="about_me"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Über mich Text 👤</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea 
                        placeholder="Erzählen Sie etwas über sich und Ihre Erfahrung..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <Button 
                      type="button"
                      onClick={() => saveAboutMe(field.value)}
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