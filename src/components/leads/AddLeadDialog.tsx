import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Platform, platformsConfig } from "@/config/platforms";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  platform: z.custom<Platform>(),
  social_media_username: z.string().optional(),
  phase_id: z.string().min(1, "Phase ist erforderlich"),
  pipeline_id: z.string().min(1, "Pipeline ist erforderlich"),
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: defaultPlatform || "LinkedIn" as Platform,
      social_media_username: "",
      phase_id: defaultPhase || "",
      pipeline_id: pipelineId || "",
    },
  });

  const platform = form.watch("platform");

  const scanInstagramProfile = async (username: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('scan-social-profile', {
        body: { username, platform: 'Instagram' }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error scanning Instagram profile:', error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let profileData = null;
      if (values.platform === "Instagram" && values.social_media_username) {
        try {
          toast.loading("Scanne Instagram Profil...");
          profileData = await scanInstagramProfile(values.social_media_username);
          if (!profileData) {
            throw new Error("Kein Profil gefunden");
          }
          toast.success("Instagram Profil erfolgreich gescannt!");
        } catch (error) {
          console.error("Error scanning Instagram profile:", error);
          toast.error("Fehler beim Scannen des Instagram-Profils");
          return;
        }
      }

      const { error } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: profileData?.name || values.social_media_username,
          platform: values.platform,
          social_media_username: values.social_media_username,
          phase_id: values.phase_id,
          pipeline_id: values.pipeline_id,
          industry: "Not Specified",
          social_media_bio: profileData?.bio,
          instagram_followers: profileData?.followers,
          instagram_following: profileData?.following,
          instagram_posts: profileData?.posts,
          instagram_engagement_rate: profileData?.engagement_rate,
          instagram_profile_image_url: profileData?.profileImageUrl,
        });

      if (error) throw error;

      toast.success("Kontakt erfolgreich hinzugefügt");
      setIsOpen(false);
      onOpenChange?.(false);
      form.reset();
      navigate("/contacts");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Fehler beim Hinzufügen des Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Kontakt hinzufügen ✨</DialogTitle>
          <DialogDescription>
            {defaultPlatform === "Instagram" 
              ? "Geben Sie den Instagram Benutzernamen ein. Wir holen automatisch die Profildaten."
              : "Fügen Sie hier die Details Ihres neuen Kontakts hinzu."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!defaultPlatform && (
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontaktquelle 🌐</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wo haben Sie den Kontakt kennengelernt?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformsConfig.map((config) => (
                          <SelectItem key={config.name} value={config.name}>
                            <div className="flex items-center">
                              <config.icon className="h-4 w-4 mr-2" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(defaultPlatform === "Instagram" || form.watch("platform") === "Instagram") && (
              <FormField
                control={form.control}
                name="social_media_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Benutzername 📱</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Benutzername (ohne @ oder URL)" 
                        {...field} 
                        onChange={(e) => {
                          const username = e.target.value.replace(/^@/, '');
                          field.onChange(username);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <input type="hidden" {...form.register("phase_id")} />
            <input type="hidden" {...form.register("pipeline_id")} />

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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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