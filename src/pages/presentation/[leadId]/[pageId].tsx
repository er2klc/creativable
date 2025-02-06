import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PresentationLoading } from '@/components/presentation/PresentationLoading';
import { PresentationError } from '@/components/presentation/PresentationError';
import { PresentationContent } from '@/components/presentation/PresentationContent';
import { PresentationPageData } from '@/components/presentation/types';

export default function PresentationPage() {
  const { leadId, pageId } = useParams();
  const [pageData, setPageData] = useState<PresentationPageData | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPresentationPage();

    const handleUnload = () => {
      if (viewId) {
        const metadata = {
          type: 'youtube',
          event_type: 'video_closed'
        };

        navigator.sendBeacon(
          `${window.location.origin}/api/presentation-view/${viewId}`,
          JSON.stringify({ 
            completed: false,
            metadata 
          })
        );
      }
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [leadId, pageId]);

  const loadPresentationPage = async () => {
    if (!leadId || !pageId) {
      setError("Invalid URL");
      setIsLoading(false);
      return;
    }

    try {
      // Präsentationsseite abrufen
      const { data: pageData, error: pageError } = await supabase
  .from('presentation_pages')
  .select(`
    id,
    title,
    video_url,
    expires_at,
    is_url_active,
    lead:lead_id (
      name,
      social_media_profile_image_url
    ),
    profiles:user_id (
      display_name,
      avatar_url
    )
  `)
  .eq('slug', pageId)
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

      // Ablaufdatum prüfen
      if (pageData.expires_at && new Date(pageData.expires_at) < new Date()) {
        setError("This presentation has expired");
        setIsLoading(false);
        return;
      }

      // Falls URL deaktiviert ist
      if (!pageData.is_url_active) {
        setError("This presentation is no longer available");
        setIsLoading(false);
        return;
      }

      // Daten in den State setzen
      setPageData(pageData);

      // Tracking-View speichern
      const { data: viewData, error: viewError } = await supabase
  .from('presentation_views')
  .insert([
    {
      page_id: pageData.id,
      lead_id: leadId,
      video_progress: 0,
      completed: false,
      metadata: JSON.stringify({
        type: 'youtube',
        event_type: 'video_opened'
      })
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

    const isCompleted = progress >= 95;
    const metadata = {
      type: 'youtube',
      event_type: isCompleted ? 'video_completed' : 'video_progress'
    };

    const { error } = await supabase
      .from('presentation_views')
      .update({
        video_progress: progress,
        completed: isCompleted,
        metadata
      })
      .eq('id', viewId);

    if (error) {
      console.error('Error updating view progress:', error);
    }
  };

  if (isLoading) return <PresentationLoading />;
  if (error || !pageData) return <PresentationError error={error || "Presentation not found"} />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      <PresentationContent pageData={pageData} onProgress={handleProgress} />
    </div>
  );
}
