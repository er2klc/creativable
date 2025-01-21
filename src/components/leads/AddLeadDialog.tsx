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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: defaultPlatform || "LinkedIn" as Platform,
      social_media_username: "",
      phase_id: defaultPhase || "",
      pipeline_id: pipelineId || "",
    },
  });

  const scanInstagramProfile = async (username: string) => {
    try {
      setIsLoading(true);
      toast.loading("Scanne Instagram Profil...");
      
      const { data, error } = await supabase.functions.invoke('scan-social-profile', {
        body: { 
          username,
          platform: 'Instagram',
          leadId: null
        }
      });

      if (error) throw error;
      
      console.log("Profile data received:", data);
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
      if ((defaultPlatform === "Instagram" || values.platform === "Instagram") && values.social_media_username) {
        try {
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
          platform: defaultPlatform || values.platform,
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
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Fehler beim Hinzufügen des Kontakts");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformSelect = (platform: Platform) => {
    form.setValue("platform", platform);
    if (platform === "Instagram") {
      setIsOpen(true);
    }
  };

  
