import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Instagram } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { AILoadingAnimation } from "@/components/auth/AILoadingAnimation";

const formSchema = z.object({
  username: z.string().min(1, "Instagram username is required"),
});

interface CreateInstagramContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  phaseId: string;
}

export function CreateInstagramContactDialog({ 
  open, 
  onOpenChange,
  pipelineId,
  phaseId
}: CreateInstagramContactDialogProps) {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsScanning(true);
      
      // Call Apify to scan the profile
      const { data: scanData, error: scanError } = await supabase.functions.invoke('scan-social-profile', {
        body: { 
          platform: 'instagram',
          username: values.username 
        }
      });

      if (scanError) throw scanError;

      if (!scanData) {
        throw new Error("No data returned from scan");
      }

      // Create the lead with the scanned data
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          name: scanData.name || values.username,
          platform: 'Instagram',
          social_media_username: values.username,
          pipeline_id: pipelineId,
          phase_id: phaseId,
          social_media_bio: scanData.bio,
          social_media_followers: scanData.followers,
          social_media_following: scanData.following,
          social_media_profile_image_url: scanData.profileImageUrl,
          industry: "Not Specified"
        });

      if (leadError) throw leadError;

      toast.success(
        settings?.language === "en" 
          ? "Instagram contact created successfully" 
          : "Instagram-Kontakt erfolgreich erstellt"
      );
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating Instagram contact:', error);
      toast.error(
        settings?.language === "en"
          ? "Error creating Instagram contact"
          : "Fehler beim Erstellen des Instagram-Kontakts"
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            {settings?.language === "en" ? "Create Instagram Contact" : "Instagram-Kontakt erstellen"}
          </DialogTitle>
        </DialogHeader>

        {isScanning ? (
          <AILoadingAnimation />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {settings?.language === "en" ? "Username" : "Benutzername"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="@username"
                        onChange={(e) => {
                          // Remove @ if user types it
                          const value = e.target.value.replace('@', '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {settings?.language === "en" ? "Cancel" : "Abbrechen"}
                </Button>
                <Button type="submit">
                  {settings?.language === "en" ? "Create" : "Erstellen"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}