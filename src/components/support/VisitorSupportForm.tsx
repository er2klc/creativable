import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  subject: z.string().min(1, "Bitte gib einen Betreff ein"),
  message: z.string().min(10, "Deine Nachricht sollte mindestens 10 Zeichen lang sein"),
});

export const VisitorSupportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        email: values.email,
        subject: values.subject,
        message: values.message,
        is_visitor: true,
      });

      if (error) throw error;

      toast.success("Deine Anfrage wurde erfolgreich gesendet!");
      form.reset();
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast.error("Es gab einen Fehler beim Senden deiner Anfrage. Bitte versuche es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#1A1F2C]/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input
                    placeholder="deine@email.de"
                    {...field}
                    className="bg-[#0A0A0A]/60 border-white/10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Betreff</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Wie können wir dir helfen?"
                    {...field}
                    className="bg-[#0A0A0A]/60 border-white/10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachricht</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreibe dein Anliegen..."
                    className="min-h-[150px] bg-[#0A0A0A]/60 border-white/10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};