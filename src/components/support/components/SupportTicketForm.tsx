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
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  subject: z.string().min(1, "Bitte gib einen Betreff ein"),
  message: z.string().min(10, "Deine Nachricht sollte mindestens 10 Zeichen lang sein"),
});

export const SupportTicketForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
        <div className="relative">
          <Button
            type="submit"
            disabled={isSubmitting}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full bg-[#1A1F2C]/60 hover:bg-[#2A2F3C]/60 text-white border border-white/10 backdrop-blur-sm transition-all duration-300"
          >
            {isSubmitting ? "Wird erstellt..." : "Ticket erstellen"}
          </Button>
          <div 
            className={cn(
              "absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-transform duration-300",
              isHovered ? "scale-x-100" : "scale-x-0"
            )}
          />
        </div>
      </form>
    </Form>
  );
};