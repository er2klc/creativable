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
  return (
    <div className="col-span-8 aspect-video w-full bg-black rounded-lg overflow-hidden">
      <VideoPlayer
        videoUrl={videoUrl}
        onProgress={onVideoProgress}
        savedProgress={savedProgress}
        onDuration={onDuration}
      />
    </div>
  );
};