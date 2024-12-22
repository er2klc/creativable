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
import * as z from "zod";

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [otherPlatform, setOtherPlatform] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: "LinkedIn",
      customPlatform: "",
      socialMediaUsername: "",
      phase: "initial_contact",
      industry: "",
      lastAction: "",
      notes: "",
      companyName: "",
      productsServices: "",
      targetAudience: "",
      usp: "",
      businessDescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Fehler ❌",
        description: "Sie müssen eingeloggt sein, um einen Lead hinzuzufügen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("leads").insert({
        user_id: session.user.id,
        name: values.name,
        platform: otherPlatform ? values.customPlatform : values.platform,
        social_media_username: values.socialMediaUsername,
        phase: values.phase,
        industry: values.industry,
        last_action: values.lastAction || null,
        notes: values.notes || null,
        company_name: values.companyName || null,
        products_services: values.productsServices || null,
        target_audience: values.targetAudience || null,
        usp: values.usp || null,
        business_description: values.businessDescription || null,
      });

      if (error) throw error;

      toast({
        title: "Erfolg ✨",
        description: "Lead erfolgreich hinzugefügt",
      });

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding lead:", error);
      toast({
        title: "Fehler ❌",
        description: "Beim Hinzufügen des Leads ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lead ✨
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Lead hinzufügen ✨</DialogTitle>
          <DialogDescription>
            Fügen Sie hier die Details Ihres neuen Leads hinzu. Füllen Sie alle erforderlichen Felder aus.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddLeadFormFields
              form={form}
              otherPlatform={otherPlatform}
              setOtherPlatform={setOtherPlatform}
            />
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