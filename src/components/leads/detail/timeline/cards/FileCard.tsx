import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";

interface FileCardProps {
  content: string;
  metadata?: {
    fileName?: string;
    filePath?: string;
    fileType?: string;
  };
}

export const FileCard = ({ content, metadata }: FileCardProps) => {
  const [showPreview, setShowPreview] = useState(false);
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
        <button 
          onClick={() => setShowPreview(true)} 
          className="mt-2"
        >
          <img 
            src={imageUrl} 
            alt={content}
            className="mt-2 max-h-32 rounded-lg object-contain"
          />
        </button>
        {showPreview && metadata.filePath && (
          <DocumentPreview
            document={{
              name: metadata.fileName || 'File',
              url: imageUrl,
              file_type: metadata.fileType,
            }}
            open={showPreview}
            onOpenChange={setShowPreview}
          />
        )}
      </div>
    );
  }

  // For non-image files
  return (
    <div>
      <button 
        onClick={() => setShowPreview(true)}
        className="whitespace-pre-wrap break-words hover:text-blue-600 transition-colors"
      >
        {content}
      </button>
      {showPreview && metadata?.filePath && (
        <DocumentPreview
          document={{
            name: metadata.fileName || 'File',
            url: supabase.storage.from('documents').getPublicUrl(metadata.filePath).data.publicUrl,
            file_type: metadata.fileType,
          }}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  );
};