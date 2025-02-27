
import { useState } from "react";
import { Phone, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { DeleteButton } from "./DeleteButton";
import { MetadataDisplay } from "./MetadataDisplay";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

interface CallScriptCardProps {
  content: string;
  scriptType: string;
  created_at?: string;
  onDelete?: () => void;
}

export function CallScriptCard({ 
  content, 
  scriptType, 
  created_at,
  onDelete 
}: CallScriptCardProps) {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const maxPreviewLength = 150;
  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent = isExpanded ? content : content.slice(0, maxPreviewLength) + (shouldTruncate ? '...' : '');

  const getTypeLabel = () => {
    switch(scriptType) {
      case 'introduction':
        return settings?.language === "en" ? "Introduction Script" : "Erstgespräch Script";
      case 'follow_up':
        return settings?.language === "en" ? "Follow-up Script" : "Folgegespräch Script";
      case 'closing':
        return settings?.language === "en" ? "Closing Script" : "Abschluss Script";
      default:
        return settings?.language === "en" ? "Call Script" : "Telefonscript";
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(
        settings?.language === "en"
          ? "Script copied to clipboard"
          : "Script in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Error copying script"
          : "Fehler beim Kopieren des Scripts"
      );
    }
  };

  return (
    <div className="relative group bg-white border border-orange-500 rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Phone className="h-4 w-4 text-orange-500" />
        <span className="font-medium">{getTypeLabel()}</span>
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
      
      <div className="prose prose-sm max-w-none dark:prose-invert mb-2">
        <ReactMarkdown className="whitespace-pre-wrap break-words">{displayContent}</ReactMarkdown>
      </div>
      
      <div className="flex items-center justify-between">
        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-auto text-xs flex items-center"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                {settings?.language === "en" ? "Show less" : "Weniger anzeigen"}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                {settings?.language === "en" ? "Show more" : "Mehr anzeigen"}
              </>
            )}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="p-1 h-auto text-xs flex items-center ml-auto"
        >
          <Copy className="h-3 w-3 mr-1" />
          {settings?.language === "en" ? "Copy" : "Kopieren"}
        </Button>
      </div>
      
      <MetadataDisplay created_at={created_at} />
    </div>
  );
}
