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
  
  if (!metadata?.filePath) {
    return <div className="whitespace-pre-wrap break-words">{content}</div>;
  }

  const fileUrl = supabase.storage
    .from('documents')
    .getPublicUrl(metadata.filePath).data.publicUrl;

  return (
    <div>
      <button 
        onClick={() => setShowPreview(true)} 
        className="whitespace-pre-wrap break-words hover:text-blue-600 transition-colors"
      >
        {content}
      </button>
      {showPreview && (
        <DocumentPreview
          document={{
            name: metadata.fileName || 'File',
            url: fileUrl,
            file_type: metadata.fileType,
          }}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  );
};