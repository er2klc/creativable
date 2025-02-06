import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";
import { VideoPlayer } from "@/components/elevate/platform/detail/video/VideoPlayer";
import { PresentationPageData } from "./types";

interface PresentationContentProps {
  pageData: PresentationPageData;
  onProgress: (progress: number) => void;
}

export const PresentationContent = ({ pageData, onProgress }: PresentationContentProps) => {
  return (
    <Card className="relative w-full max-w-[900px] mx-auto bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={pageData?.user?.profiles?.avatar_url} alt={pageData?.user?.profiles?.display_name} />
              <AvatarFallback>{pageData?.user?.profiles?.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-white font-medium">{pageData?.user?.profiles?.display_name}</span>
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
            onProgress={onProgress}
            onDuration={console.log}
            autoplay={true}
          />
        </div>
      </div>
    </Card>
  );
};