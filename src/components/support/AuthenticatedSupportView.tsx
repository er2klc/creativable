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
import { Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  subject: z.string().min(1, "Bitte gib einen Betreff ein"),
  message: z.string().min(10, "Deine Nachricht sollte mindestens 10 Zeichen lang sein"),
});

export const AuthenticatedSupportView = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          email: user.email,
          subject: values.subject,
          message: values.message,
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Upload attachments if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${ticket.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          await supabase.from("support_ticket_attachments").insert({
            ticket_id: ticket.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
          });
        }
      }

      toast.success("Dein Support-Ticket wurde erfolgreich erstellt!");
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast.error("Es gab einen Fehler beim Erstellen des Tickets. Bitte versuche es später erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#1A1F2C]/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-6">Neues Support-Ticket erstellen</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-white/10 rounded-md shadow-sm text-sm font-medium text-white bg-[#0A0A0A]/60 hover:bg-[#1A1F2C]/60"
              >
                <Upload className="h-4 w-4 mr-2" />
                Screenshots hochladen
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFiles.length > 0 && (
                <div className="text-sm text-gray-400">
                  {selectedFiles.length} Datei(en) ausgewählt
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? "Wird erstellt..." : "Ticket erstellen"}
            </Button>
          </form>
        </Form>
      </motion.div>

      {tickets && tickets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1A1F2C]/60 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-6">Deine Support-Tickets</h2>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-lg bg-[#0A0A0A]/60 border border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <p className="text-sm text-gray-400 mt-1">{ticket.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                    ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {ticket.status === 'open' ? 'Offen' :
                     ticket.status === 'in_progress' ? 'In Bearbeitung' :
                     'Geschlossen'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};