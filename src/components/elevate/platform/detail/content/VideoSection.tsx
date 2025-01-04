import { VideoPlayer } from "../VideoPlayer";

interface VideoSectionProps {
  videoUrl: string;
  onVideoProgress: (progress: number) => void;
  savedProgress?: number;
  onDuration: (duration: number) => void;
}

export const VideoSection = ({
  videoUrl,
  onVideoProgress,
  savedProgress,
  onDuration,
}: VideoSectionProps) => {
  if (!videoUrl) {
    return (
      <div className="col-span-8 aspect-video w-full bg-black rounded-lg flex items-center justify-center">
        <span className="text-white">Kein Video verfügbar</span>
      </div>
    );
  }

  return (
    <div className="col-span-8 aspect-video w-full bg-black rounded-lg overflow-hidden">
      <VideoPlayer
        key={videoUrl} // Add key to force remount on URL change
        videoUrl={videoUrl}
        onProgress={onVideoProgress}
        savedProgress={savedProgress}
        onDuration={onDuration}
      />
    </div>
  );
};