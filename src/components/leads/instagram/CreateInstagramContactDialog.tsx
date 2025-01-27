import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { useQuery } from "@tanstack/react-query";
import { InstagramScanAnimation } from "./InstagramScanAnimation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

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
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPhaseOneComplete, setIsPhaseOneComplete] = useState(false);
  const [isMediaProcessingActive, setIsMediaProcessingActive] = useState(false);
  const [username, setUsername] = useState("");
  const { settings } = useSettings();

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

  const pollProgress = async (leadId: string) => {
    console.log('Starting progress polling for lead:', leadId);
    let lastProgress = 0;
    let totalMediaFiles = 0;
    let processedMediaFiles = 0;
    let simulationInterval: NodeJS.Timeout | null = null;
    let isPollingActive = true;
    
    const interval = setInterval(async () => {
      if (!isPollingActive) {
        if (simulationInterval) clearInterval(simulationInterval);
        clearInterval(interval);
        return;
      }

      try {
        const { data: posts, error } = await supabase
          .from('social_media_posts')
          .select('processing_progress, bucket_path, media_urls, current_file, media_processing_status')
          .eq('lead_id', leadId)
          .order('processing_progress', { ascending: false });

        if (error) {
          console.error('Error polling progress:', error);
          return;
        }

        // Get the post with the highest progress
        const latestPost = posts && posts.length > 0 ? posts[0] : null;
        if (!latestPost) return;

        const currentProgress = latestPost.processing_progress ?? lastProgress;
        console.log('Current progress:', currentProgress, 'Current Phase:', currentPhase, 'Phase One Complete:', isPhaseOneComplete);
        
        // Phase 1: Profile Scanning
        if (currentPhase === 1 && !isPhaseOneComplete) {
          if (currentProgress >= 27 && currentProgress < 100 && !simulationInterval) {
            let simulatedProgress = currentProgress;
            simulationInterval = setInterval(() => {
              simulatedProgress = Math.min(simulatedProgress + 2, 100);
              setScanProgress(simulatedProgress);
              
              if (simulatedProgress >= 100) {
                clearInterval(simulationInterval!);
                simulationInterval = null;
                setIsPhaseOneComplete(true);
                setCurrentPhase(2);
                console.log('Phase 1 completed, transitioning to Phase 2');
              }
            }, 100);
          } else if (currentProgress < 27) {
            setScanProgress(currentProgress);
          }
          lastProgress = currentProgress;
        }
        
        // Phase 2: Media Saving
        if ((currentPhase === 2 || isPhaseOneComplete) && !isMediaProcessingActive && latestPost.media_urls) {
          setIsMediaProcessingActive(true);
          totalMediaFiles = latestPost.media_urls.length;
          processedMediaFiles = 0;
          setMediaProgress(0);
          console.log(`Starting media phase, total files: ${totalMediaFiles}`);
          
          if (totalMediaFiles === 0) {
            setCurrentFile("No media files to process");
            setMediaProgress(100);
            setIsSuccess(true);
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created", {
              icon: <CheckCircle className="h-5 w-5 text-green-500" />
            });
            return;
          }
        }
        
        // Update media progress based on saved files
        if (isMediaProcessingActive && latestPost.bucket_path) {
          processedMediaFiles++;
          if (latestPost.current_file) {
            setCurrentFile(latestPost.current_file);
          }
          const mediaProgressPercent = Math.min(
            Math.round((processedMediaFiles / (totalMediaFiles || 1)) * 100),
            100
          );
          setMediaProgress(mediaProgressPercent);
          console.log(`Media progress: ${mediaProgressPercent}%, File: ${latestPost.bucket_path}`);

          if (mediaProgressPercent >= 100 || latestPost.media_processing_status === 'completed') {
            console.log('Media processing completed');
            setIsSuccess(true);
            isPollingActive = false;
            clearInterval(interval);
            toast.success("Contact successfully created", {
              icon: <CheckCircle className="h-5 w-5 text-green-500" />
            });
          }
        }
      } catch (err) {
        console.error('Error in progress polling:', err);
      }
    }, 500);

    return () => {
      console.log('Cleaning up progress polling');
      isPollingActive = false;
      clearInterval(interval);
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  };

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Please enter an Instagram username");
      return;
    }

    try {
      setIsLoading(true);
      setScanProgress(0);
      setMediaProgress(0);
      setCurrentFile(undefined);
      setCurrentPhase(1);
      setIsPhaseOneComplete(false);
      setIsMediaProcessingActive(false);
      setIsSuccess(false);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (!settings?.apify_api_key) {
        toast.error("Please add an Apify API key in settings first");
        return;
      }

      const targetPipelineId = pipelineId || defaultPipeline?.id;
      const targetPhaseId = defaultPhase || firstPhase?.id;

      if (!targetPipelineId || !targetPhaseId) {
        toast.error("No pipeline or phase found");
        return;
      }

      // Create the lead with basic info
      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert({
          user_id: user.id,
          name: username,
          platform: "Instagram",
          social_media_username: username,
          pipeline_id: targetPipelineId,
          phase_id: targetPhaseId,
          industry: "Not Specified"
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // Start polling for progress
      pollProgress(lead.id);

      // Trigger the scan profile function
      const { error } = await supabase.functions.invoke('scan-social-profile', {
        body: {
          platform: 'instagram',
          username: username,
          leadId: lead.id
        }
      });

      if (error) throw error;

    } catch (error) {
      console.error("Error adding Instagram contact:", error);
      toast.error("Error adding Instagram contact");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Instagram Contact</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <InstagramScanAnimation 
            scanProgress={scanProgress} 
            mediaProgress={mediaProgress}
            currentFile={currentFile}
            currentPhase={currentPhase}
          />
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Instagram Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                placeholder="Enter Instagram username"
                disabled={isLoading}
              />
            </div>
            
            {isSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="mt-2 text-green-700">
                  Contact successfully created!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Add Contact"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}