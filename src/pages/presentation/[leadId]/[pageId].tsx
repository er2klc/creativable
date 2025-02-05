import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/elevate/platform/detail/video/VideoPlayer';
import { Card } from '@/components/ui/card';
import { toast } from "sonner";

interface PresentationPageData {
  title: string;
  video_url: string;
  lead_id: string;
}

export default function PresentationPage() {
  const { leadId, pageId } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PresentationPageData | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPresentationPage();
  }, [leadId, pageId]);

  const loadPresentationPage = async () => {
    if (!leadId || !pageId) {
      setError("Invalid URL");
      setIsLoading(false);
      return;
    }

    try {
      // Load page data
      const { data: pageData, error: pageError } = await supabase
        .from('presentation_pages')
        .select('*')
        .eq('id', pageId)
        .maybeSingle();

      if (pageError) {
        console.error('Error loading presentation page:', pageError);
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      if (!pageData) {
        setError("Presentation not found");
        setIsLoading(false);
        return;
      }

      // Check if URL is expired or inactive
      if (pageData.expires_at && new Date(pageData.expires_at) < new Date()) {
        setError("This presentation has expired");
        setIsLoading(false);
        return;
      }

      if (!pageData.is_url_active) {
        setError("This presentation is no longer available");
        setIsLoading(false);
        return;
      }

      setPageData(pageData);

      // Create view record
      const { data: viewData, error: viewError } = await supabase
        .from('presentation_views')
        .insert([
          {
            page_id: pageId,
            lead_id: leadId,
            video_progress: 0,
            completed: false
          }
        ])
        .select()
        .single();

      if (viewError) {
        console.error('Error creating view record:', viewError);
      } else {
        setViewId(viewData.id);
      }
    } catch (error) {
      console.error('Error:', error);
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgress = async (progress: number) => {
    if (!viewId) return;

    const isCompleted = progress >= 95; // Consider video completed at 95%

    const { error } = await supabase
      .from('presentation_views')
      .update({
        video_progress: progress,
        completed: isCompleted
      })
      .eq('id', viewId);

    if (error) {
      console.error('Error updating view progress:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
        <Card className="relative bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-4">
              {error || "Presentation not found"}
            </h1>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      {/* Logo Background Blur */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <img 
          src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
          alt="Background Logo" 
          className="w-[800px] h-[800px] blur-xl"
        />
      </div>

      <Card className="relative w-full max-w-[900px] mx-auto bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Creativable Logo" 
            className="h-16 w-16"
          />
          
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-white">{pageData.title}</h1>
            <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
          
          {/* Video Player */}
          <div className="w-full aspect-video rounded-lg overflow-hidden">
            <VideoPlayer
              videoUrl={pageData.video_url}
              onProgress={handleProgress}
              onDuration={console.log}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}