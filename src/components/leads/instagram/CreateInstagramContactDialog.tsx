import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { scanSocialProfile } from "@/utils/apify";

const formSchema = z.object({
  username: z.string().min(1, "Username ist erforderlich"),
});

interface CreateInstagramContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string | null;
  defaultPhase?: string;
}

export function CreateInstagramContactDialog({ 
  open, 
  onOpenChange,
  pipelineId,
  defaultPhase 
}: CreateInstagramContactDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Scan Instagram profile
      const profileData = await scanSocialProfile("instagram", values.username);
      if (!profileData) throw new Error("Failed to fetch Instagram profile data");

      // Create new lead
      const { error } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: profileData.name || values.username,
          platform: "Instagram",
          social_media_username: values.username,
          pipeline_id: pipelineId,
          phase_id: defaultPhase || "",
          social_media_bio: profileData.bio,
          social_media_followers: profileData.followers,
          social_media_following: profileData.following,
          social_media_profile_image_url: profileData.profileImageUrl,
          industry: "Not Specified"
        });

      if (error) throw error;

      toast.success("Instagram-Kontakt erfolgreich hinzugefügt");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error adding Instagram contact:", error);
      toast.error("Fehler beim Hinzufügen des Instagram-Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Instagram-Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Instagram-Username eingeben" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Lädt..." : "Kontakt hinzufügen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}