import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BasicLeadFields } from "./form-fields/BasicLeadFields";
import { ContactTypeField } from "./form-fields/ContactTypeField";
import { NotesFields } from "./form-fields/NotesFields";
import { Platform } from "@/config/platforms";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  platform: z.custom<Platform>(),
  social_media_username: z.string().optional(),
  phase_id: z.string().min(1, "Phase ist erforderlich"),
  pipeline_id: z.string().min(1, "Pipeline ist erforderlich"),
  contact_type: z.string().nullable(),
  phone_number: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export interface AddLeadDialogProps {
  trigger?: React.ReactNode;
  defaultPhase?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pipelineId?: string | null;
  defaultPlatform?: Platform;
}

export function AddLeadDialog({ 
  trigger, 
  defaultPhase, 
  open, 
  onOpenChange, 
  pipelineId,
  defaultPlatform 
}: AddLeadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: defaultPlatform || "LinkedIn" as Platform,
      social_media_username: "",
      phase_id: defaultPhase || "",
      pipeline_id: pipelineId || "",
      contact_type: "",
      phone_number: "",
      email: "",
      company_name: "",
      notes: "",
    },
  });

  const scanInstagramProfile = async (username: string) => {
    try {
      const response = await fetch('/api/scan-social-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'Instagram',
          username: username
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error scanning profile:', error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let profileData = null;
      if (values.platform === "Instagram" && values.social_media_username) {
        setIsScanning(true);
        try {
          profileData = await scanInstagramProfile(values.social_media_username);
        } catch (error) {
          console.error("Error scanning Instagram profile:", error);
          toast.error("Fehler beim Scannen des Instagram-Profils");
        }
        setIsScanning(false);
      }

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
          notes: values.notes,
          industry: "Not Specified",
          ...(profileData && {
            social_media_bio: profileData.bio,
            instagram_followers: profileData.followers,
            instagram_following: profileData.following,
            instagram_posts: profileData.posts,
            instagram_engagement_rate: profileData.engagement_rate,
            instagram_profile_image_url: profileData.profileImageUrl,
          })
        });

      if (error) throw error;

      toast.success("Kontakt erfolgreich hinzugefügt");
      setIsOpen(false);
      onOpenChange?.(false);
      form.reset();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Fehler beim Hinzufügen des Kontakts");
    }
  };

  const platform = form.watch("platform");
  const username = form.watch("social_media_username");

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Kontakt hinzufügen ✨</DialogTitle>
          <DialogDescription>
            Fügen Sie hier die Details Ihres neuen Kontakts hinzu. Füllen Sie alle erforderlichen Felder aus.
            {platform === "Instagram" && (
              <span className="block mt-2 text-sm text-muted-foreground">
                Bei Instagram-Kontakten werden die Profildaten automatisch gescannt.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicLeadFields form={form} />
            <ContactTypeField form={form} />
            <NotesFields form={form} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onOpenChange?.(false);
                }}
              >
                Abbrechen ❌
              </Button>
              <Button type="submit" disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanne Profil...
                  </>
                ) : (
                  'Speichern ✅'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}