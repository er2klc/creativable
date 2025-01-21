import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Instagram } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  username: z.string().min(1, "Username ist erforderlich"),
});

interface AddFromSocialDialogProps {
  trigger?: React.ReactNode;
  defaultPhase?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pipelineId?: string | null;
}

export function AddFromSocialDialog({ trigger, defaultPhase, open, onOpenChange, pipelineId }: AddFromSocialDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      
      // Call the scan-social-profile function
      const { data, error } = await supabase.functions.invoke('scan-social-profile', {
        body: { platform: 'instagram', username: values.username }
      });

      if (error) throw error;

      if (!data) {
        toast.error("Keine Daten gefunden");
        return;
      }

      // Create new lead with Instagram data
      const { error: leadError } = await supabase
        .from("leads")
        .insert({
          name: values.username,
          platform: "Instagram",
          social_media_username: values.username,
          phase_id: defaultPhase || "",
          pipeline_id: pipelineId || "",
          instagram_followers: data.followers,
          instagram_following: data.following,
          instagram_posts: data.posts,
          instagram_engagement_rate: data.engagement_rate,
          social_media_bio: data.bio,
          instagram_verified: data.isPrivate ? false : undefined,
          industry: "Not Specified"
        });

      if (leadError) throw leadError;

      toast.success("Kontakt erfolgreich importiert");
      setIsOpen(false);
      onOpenChange?.(false);
      form.reset();
    } catch (error) {
      console.error("Error importing contact:", error);
      toast.error("Fehler beim Importieren des Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Instagram className="h-4 w-4" />
            Von Social Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Von Social Media importieren 🚀</DialogTitle>
          <DialogDescription>
            Geben Sie einen Instagram-Benutzernamen ein, um das Profil zu scannen und als Kontakt zu importieren.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Benutzername</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  onOpenChange?.(false);
                }}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Importiere..." : "Importieren"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}