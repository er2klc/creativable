export interface MediaDisplayProps {
  urls: string[];
  type: string;
}

export const MediaDisplay = ({ urls, type }: MediaDisplayProps) => {
  return (
    <div className="relative w-full">
      {type === 'video' ? (
        <video 
          src={urls[0]} 
          controls 
          className="w-full rounded-lg"
        />
      ) : (
        <img 
          src={urls[0]} 
          alt="Post media" 
          className="w-full rounded-lg"
        />
      )}
    </div>
  );
};