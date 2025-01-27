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
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { InstagramScanAnimation } from "./InstagramScanAnimation";

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
  const [scanProgress, setScanProgress] = useState(0);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>();
  const { settings } = useSettings();

  // Fetch default pipeline if none provided
  const { data: defaultPipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (pipelineId) return null;
      
      const { data: pipeline } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      
      return pipeline;
    },
    enabled: !pipelineId
  });

  // Fetch first phase of pipeline
  const { data: firstPhase } = useQuery({
    queryKey: ["first-phase", pipelineId || defaultPipeline?.id],
    queryFn: async () => {
      const targetPipelineId = pipelineId || defaultPipeline?.id;
      if (!targetPipelineId) return null;

      const { data: phase } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", targetPipelineId)
        .order("order_index")
        .limit(1)
        .maybeSingle();
      
      return phase;
    },
    enabled: !!(pipelineId || defaultPipeline?.id)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  // Progress polling function with improved error handling and debugging
  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    let lastProgress = 0;
    let mediaStarted = false;
    
    const interval = setInterval(async () => {
      try {
        const { data: posts, error } = await supabase
          .from('social_media_posts')
          .select('processing_progress, bucket_path')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        const currentProgress = posts?.processing_progress ?? lastProgress;
        console.log('Current progress:', currentProgress);
        
        // Update scan progress
        if (currentProgress < 100) {
          setScanProgress(currentProgress);
          lastProgress = currentProgress;
        } else {
          setScanProgress(100);
          
          // Start media phase if not already started
          if (!mediaStarted) {
            mediaStarted = true;
            setMediaProgress(0); // Reset media progress when starting
          }
          
          // Update media progress and file info
          if (posts?.bucket_path) {
            setCurrentFile(posts.bucket_path);
            setMediaProgress((prev) => Math.min(prev + 10, 100));
          }
        }
        
        // Clear interval when both phases are complete
        if (currentProgress >= 100 && mediaProgress >= 100) {
          console.log('Processing completed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 1000);

    return () => {
      console.log('Cleaning up progress polling');
      clearInterval(interval);
    };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setScanProgress(0);
      setMediaProgress(0);
      setCurrentFile(undefined);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!settings?.apify_api_key) {
        toast.error("Bitte fügen Sie zuerst einen Apify API Key in den Einstellungen hinzu");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("Keine Pipeline oder Phase gefunden");
        return;
      }

      // First create the lead with basic info
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: values.username,
          platform: "Instagram",
          social_media_username: values.username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Start polling for progress
      pollProgress(lead.id);

      // Then trigger the scan profile function
      const { error } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: values.username,
          leadId: lead.id
        }
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
        {isLoading ? (
          <InstagramScanAnimation 
            scanProgress={scanProgress} 
            mediaProgress={mediaProgress}
            currentFile={currentFile}
          />
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}