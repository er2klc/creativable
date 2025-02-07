
import { VideoPlayer } from '@/components/elevate/platform/detail/video/VideoPlayer';
import { PresentationPageData } from './types';

interface PresentationContentProps {
  pageData: PresentationPageData;
  onProgress: (progress: number) => void;
}

export const PresentationContent = ({ pageData, onProgress }: PresentationContentProps) => {
  return (
    <div className="w-full max-w-[1000px] mx-auto p-4">
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <VideoPlayer
          videoUrl={pageData.video_url}
          onProgress={onProgress}
          autoplay={false}
        />
      </div>
      <div className="mt-6 text-white">
        <h1 className="text-2xl font-bold">{pageData.title}</h1>
      </div>
    </div>
  );
};
