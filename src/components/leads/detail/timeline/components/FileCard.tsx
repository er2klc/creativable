import { supabase } from "@/integrations/supabase/client";

interface FileCardProps {
  content: string;
  metadata?: {
    fileName?: string;
    filePath?: string;
    fileType?: string;
  };
}

export const FileCard = ({ content, metadata }: FileCardProps) => {
  const isImage = metadata?.fileType?.toLowerCase().match(/^(image\/jpeg|image\/png|image\/gif|image\/webp)$/);
  
  if (isImage && metadata?.filePath) {
    const imageUrl = supabase.storage
      .from('documents')
      .getPublicUrl(metadata.filePath).data.publicUrl;

    return (
      <div>
        <div className="whitespace-pre-wrap break-words">
          {content}
        </div>
        <img 
          src={imageUrl} 
          alt={content}
          className="mt-2 max-h-32 rounded-lg object-contain"
        />
      </div>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words">
      {content}
    </div>
  );
};