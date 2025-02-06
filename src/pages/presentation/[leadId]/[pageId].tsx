import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/elevate/platform/detail/video/VideoPlayer';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';

interface PresentationPageData {
  title: string;
  video_url: string;
  lead_id: string;
  user: {
    profiles: {
      display_name: string;
      avatar_url: string;
    };
  };
  lead: {
    name: string;
    social_media_profile_image_url: string;
  };
}

export default function PresentationPage() {
  const { leadId, pageId } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PresentationPageData | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userIp, setUserIp] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    // Get user's IP and location
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip));

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setUserLocation(`${data.city}, ${data.country_name}`));
  }, []);

  useEffect(() => {
    loadPresentationPage();
    
    const handleUnload = () => {
      if (viewId) {
        const metadata = {
          ip: userIp,
          location: userLocation,
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
  }, [leadId, pageId, userIp, userLocation]);

  const loadPresentationPage = async () => {
    if (!leadId || !pageId) {
      setError("Invalid URL");
      setIsLoading(false);
      return;
    }

    try {
      const { data: pageData, error: pageError } = await supabase
        .from('presentation_pages')
        .select(`
          *,
          user:profiles!presentation_pages_user_id_fkey(
            display_name,
            avatar_url
          ),
          lead:leads!presentation_pages_lead_id_fkey(
            name,
            social_media_profile_image_url
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
            page_id: pageData.id,
            lead_id: leadId,
            video_progress: 0,
            completed: false,
            metadata: {
              ip: userIp,
              location: userLocation,
              type: 'youtube',
              event_type: 'video_opened'
            }
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
      ip: userIp,
      location: userLocation,
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
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      {isLoading ? (
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      ) : error ? (
        <Card className="relative bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-4">
              {error}
            </h1>
          </div>
        </Card>
      ) : pageData && (
        <Card className="relative w-full max-w-[900px] mx-auto bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={pageData?.user?.avatar_url} alt={pageData?.user?.display_name} />
                  <AvatarFallback>{pageData?.user?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{pageData?.user?.display_name}</span>
              </div>
              
              <div className="flex items-center space-x-3 text-white/50">
                <ArrowRight className="h-5 w-5" />
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={pageData?.lead?.social_media_profile_image_url} alt={pageData?.lead?.name} />
                  <AvatarFallback>{pageData?.lead?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{pageData?.lead?.name}</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-white">{pageData?.title}</h1>
              <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
            
            <div className="w-full aspect-video rounded-lg overflow-hidden">
              <VideoPlayer
                videoUrl={pageData?.video_url || ''}
                onProgress={handleProgress}
                onDuration={console.log}
                autoplay={true}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
