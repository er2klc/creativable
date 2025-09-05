import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AddLeadFormFields, formSchema, type FormData } from "./form-fields/AddLeadFormFields";
import { type Platform } from "@/config/platforms";

interface AddLeadDialogProps {
  trigger?: React.ReactNode;
  defaultPhase?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pipelineId?: string | null;
}

export function AddLeadDialog({ trigger, defaultPhase, open, onOpenChange, pipelineId }: AddLeadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [existingLead, setExistingLead] = useState<any>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: "LinkedIn" as Platform,
      social_media_username: "",
      phase_id: defaultPhase || "",
      pipeline_id: pipelineId || "",
      contact_type: "",
      phone_number: "",
      email: "",
      company_name: "",
    },
  });

  const checkExistingLead = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: existingLeads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .eq("name", name)
        .maybeSingle();

      if (error) throw error;
      return existingLeads;
    } catch (error) {
      console.error("Error checking existing lead:", error);
      return null;
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      const existingLead = await checkExistingLead(values.name);
      
      if (existingLead) {
        setExistingLead(existingLead);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: values.name,
          platform: values.platform,
          social_media_username: values.social_media_username,
          phase_id: values.phase_id,
          pipeline_id: values.pipeline_id,
          contact_type: values.contact_type || null,
          phone_number: values.phone_number,
          email: values.email,
          company_name: values.company_name,
          industry: "Not Specified"
        });

      if (error) throw error;

      toast.success("Kontakt erfolgreich hinzugefügt");
      setIsOpen(false);
      onOpenChange?.(false);
      form.reset();
      setExistingLead(null);
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Fehler beim Hinzufügen des Kontakts");
    }
  };

  return (
    <Dialog 
      open={open ?? isOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setExistingLead(null);
        }
        onOpenChange ? onOpenChange(newOpen) : setIsOpen(newOpen);
      }}
      modal={true}
    >
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[600px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Neuen Kontakt hinzufügen ✨</DialogTitle>
          <DialogDescription>
            Fügen Sie hier die Details Ihres neuen Kontakts hinzu. Füllen Sie alle erforderlichen Felder aus.
          </DialogDescription>
        </DialogHeader>

        {existingLead && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ein Kontakt mit diesem Namen existiert bereits!
              <div className="mt-2">
                <strong>Details:</strong>
                <p>Name: {existingLead.name}</p>
                <p>Platform: {existingLead.platform}</p>
                {existingLead.contact_type && <p>Kontakttyp: {existingLead.contact_type}</p>}
                {existingLead.email && <p>Email: {existingLead.email}</p>}
                {existingLead.phone_number && <p>Telefon: {existingLead.phone_number}</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AddLeadFormFields form={form} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onOpenChange?.(false);
                  setExistingLead(null);
                }}
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