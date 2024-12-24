import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { AddLeadFormFields, formSchema } from "./AddLeadFormFields";
import { generateSocialMediaUrl } from "./form-fields/SocialMediaFields";
import * as z from "zod";

interface AddLeadDialogProps {
  trigger?: React.ReactNode;
  defaultPhase?: string;
}

export function AddLeadDialog({ trigger, defaultPhase }: AddLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: "LinkedIn",
      socialMediaUsername: "",
      phase: defaultPhase || "",
      contact_type: [],
      phone_number: "",
      email: "",
      company_name: "",
      notes: "",
      industry: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Fehler ❌",
        description: "Sie müssen eingeloggt sein, um einen Kontakt hinzuzufügen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const socialMediaUrl = generateSocialMediaUrl(values.platform, values.socialMediaUsername);
      
      // Convert contact_type array to a valid single value or null
      const contactType = values.contact_type && values.contact_type.length > 0 
        ? values.contact_type[0] // Take only the first selected value
        : null;

      const { error } = await supabase.from("leads").insert({
        user_id: session.user.id,
        name: values.name,
        platform: values.platform,
        social_media_username: socialMediaUrl,
        phase: values.phase,
        contact_type: contactType, // Use the single value
        phone_number: values.phone_number || null,
        email: values.email || null,
        company_name: values.company_name || null,
        notes: values.notes || null,
        industry: values.industry,
      });

      if (error) throw error;

      toast({
        title: "Erfolg ✨",
        description: "Kontakt erfolgreich hinzugefügt",
      });

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Fehler ❌",
        description: "Beim Hinzufügen des Kontakts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Kontakt ✨
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Kontakt hinzufügen ✨</DialogTitle>
          <DialogDescription>
            Fügen Sie hier die Details Ihres neuen Kontakts hinzu. Füllen Sie alle erforderlichen Felder aus.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddLeadFormFields form={form} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen ❌
              </Button>
              <Button type="submit">Speichern ✅</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}