import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/elevate/platform/detail/video/VideoPlayer';
import { Card } from '@/components/ui/card';

interface PresentationPageData {
  title: string;
  video_url: string;
  lead_id: string;
}

export default function PresentationPage() {
  const { leadId, pageId } = useParams();
  const [pageData, setPageData] = useState<PresentationPageData | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    loadPresentationPage();
  }, [leadId, pageId]);

  const loadPresentationPage = async () => {
    if (!leadId || !pageId) return;

    // Load page data
    const { data: pageData, error: pageError } = await supabase
      .from('presentation_pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (pageError) {
      console.error('Error loading presentation page:', pageError);
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
      return;
    }

    setViewId(viewData.id);
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

  if (!pageData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      {/* Logo Background Blur */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img 
          src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
          alt="Background Logo" 
          className="w-[800px] h-[800px] blur-3xl"
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
            
            {/* Display URL */}
            <p className="text-sm text-gray-400 break-all">
              {window.location.href}
            </p>
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