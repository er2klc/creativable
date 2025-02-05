
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/elevate/platform/detail/video/VideoPlayer';

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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">{pageData.title}</h1>
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <VideoPlayer
            videoUrl={pageData.video_url}
            onProgress={handleProgress}
            onDuration={console.log}
          />
        </div>
      </div>
    </div>
  );
}
