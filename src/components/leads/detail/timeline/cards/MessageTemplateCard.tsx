
import { useState } from "react";
import { Send, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { DeleteButton } from "./DeleteButton";
import { MetadataDisplay } from "./MetadataDisplay";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MessageTemplateCardProps {
  content: string;
  messageType: string;
  platform: string;
  created_at?: string;
  onDelete?: () => void;
}

export function MessageTemplateCard({ 
  content, 
  messageType, 
  platform,
  created_at,
  onDelete 
}: MessageTemplateCardProps) {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const maxPreviewLength = 150;
  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent = isExpanded ? content : content.slice(0, maxPreviewLength) + (shouldTruncate ? '...' : '');

  const getTypeLabel = () => {
    switch(messageType) {
      case 'introduction':
        return settings?.language === "en" ? "Intro Message" : "Erstansprache";
      case 'follow_up':
        return settings?.language === "en" ? "Follow-up" : "Nachfassen";
      case 'response':
        return settings?.language === "en" ? "Response" : "Antwort";
      default:
        return settings?.language === "en" ? "Message" : "Nachricht";
    }
  };

  const getColorByPlatform = () => {
    switch(platform) {
      case 'Instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'LinkedIn':
        return 'bg-blue-600';
      case 'Facebook':
        return 'bg-blue-500';
      case 'WhatsApp':
        return 'bg-green-500';
      case 'Email':
        return 'bg-gray-500';
      case 'TikTok':
        return 'bg-black';
      default:
        return 'bg-gray-400';
    }
  };

  const getBorderColorByPlatform = () => {
    switch(platform) {
      case 'Instagram':
        return 'border-pink-500';
      case 'LinkedIn':
        return 'border-blue-600';
      case 'Facebook':
        return 'border-blue-500';
      case 'WhatsApp':
        return 'border-green-500';
      case 'Email':
        return 'border-gray-500';
      case 'TikTok':
        return 'border-black';
      default:
        return 'border-gray-400';
    }
  };

  const getIconColorByPlatform = () => {
    switch(platform) {
      case 'Instagram':
        return 'text-pink-500';
      case 'LinkedIn':
        return 'text-blue-600';
      case 'Facebook':
        return 'text-blue-500';
      case 'WhatsApp':
        return 'text-green-500';
      case 'Email':
        return 'text-gray-500';
      case 'TikTok':
        return 'text-black';
      default:
        return 'text-gray-400';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(
        settings?.language === "en"
          ? "Message copied to clipboard"
          : "Nachricht in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Error copying message"
          : "Fehler beim Kopieren der Nachricht"
      );
    }
  };

  return (
    <div className={`relative group bg-white border rounded-lg shadow-sm p-4 ${getBorderColorByPlatform()}`}>
      <div className="flex items-center gap-2 mb-2">
        <Send className={`h-4 w-4 ${getIconColorByPlatform()}`} />
        <span className="font-medium">{getTypeLabel()}</span>
        <Badge className={`text-xs text-white ${getColorByPlatform()}`}>
          {platform}
        </Badge>
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
      
      <div className="whitespace-pre-wrap mb-2 text-sm">
        {displayContent}
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
