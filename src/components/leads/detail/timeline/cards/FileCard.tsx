import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentPreview } from "@/components/elevate/platform/detail/DocumentPreview";
import { FileText, Image } from "lucide-react";

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

  const isImage = metadata.fileType?.toLowerCase().match(/^(image\/jpeg|image\/png|image\/gif|image\/webp)$/);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isImage ? <Image className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
        <button 
          onClick={() => setShowPreview(true)} 
          className="text-left hover:text-blue-600 transition-colors"
        >
          <span className="whitespace-pre-wrap break-words">{content}</span>
        </button>
      </div>
      
      {/* Show thumbnail for images */}
      {isImage && (
        <button 
          onClick={() => setShowPreview(true)}
          className="block w-full"
        >
          <img 
            src={fileUrl} 
            alt={content}
            className="max-h-32 rounded-lg object-contain hover:opacity-90 transition-opacity"
          />
        </button>
      )}

      {/* Preview dialog for all file types */}
      {showPreview && (
        <DocumentPreview
          document={{
            name: metadata.fileName || content,
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