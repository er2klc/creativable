
import { cn } from "@/lib/utils";
import { Bot, Copy, ThumbsUp, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import ReactMarkdown from 'react-markdown';

interface NexusTimelineCardProps {
  content: string;
  metadata: {
    type: string;
    analysis_type?: string;
    completed?: boolean;
    completed_at?: string;
    phase?: {
      id: string;
      name: string;
    };
    timestamp?: string;
    analysis?: {
      social_media_bio?: string;
      hashtags?: string[];
      engagement_metrics?: {
        followers?: number;
        engagement_rate?: number;
      };
    };
  };
  onDelete?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const NexusTimelineCard = ({ 
  content, 
  metadata, 
  onDelete,
  onRegenerate,
  isRegenerating 
}: NexusTimelineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings } = useSettings();
  const maxPreviewLength = 300;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(
        settings?.language === "en"
          ? "Analysis copied to clipboard"
          : "Analyse in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Error copying analysis"
          : "Fehler beim Kopieren der Analyse"
      );
    }
  };

  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent = isExpanded ? content : content.slice(0, maxPreviewLength) + (shouldTruncate ? '...' : '');

  return (
    <div className={cn(
      "rounded-lg p-4 space-y-2 relative",
      "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
      "before:bg-gradient-to-r before:from-blue-500 before:to-purple-500",
      "before:-z-10",
      "after:absolute after:inset-[1px] after:rounded-lg",
      "after:bg-background after:-z-10"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Nexus AI</span>
          {metadata.phase?.name && (
            <>
              <span>•</span>
              <span>{metadata.phase.name}</span>
            </>
          )}
          {metadata.completed && (
            <>
              <span>•</span>
              <span className="text-green-500">
                {settings?.language === "en" ? "Completed" : "Abgeschlossen"}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <ThumbsUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{displayContent}</ReactMarkdown>
      </div>

      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Show less" : "Weniger anzeigen"}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Show more" : "Mehr anzeigen"}
            </>
          )}
        </Button>
      )}

      {metadata.analysis && (
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            className="text-xs w-full justify-start"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Analyse ausblenden" : "Analyse anzeigen"}
          </Button>
          
          {isExpanded && (
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              {metadata.analysis.social_media_bio && (
                <div>
                  <strong>Bio:</strong> {metadata.analysis.social_media_bio}
                </div>
              )}
              {metadata.analysis.hashtags && metadata.analysis.hashtags.length > 0 && (
                <div>
                  <strong>Hashtags:</strong> {metadata.analysis.hashtags.join(", ")}
                </div>
              )}
              {metadata.analysis.engagement_metrics && (
                <div className="flex gap-4">
                  {metadata.analysis.engagement_metrics.followers && (
                    <span><strong>Followers:</strong> {metadata.analysis.engagement_metrics.followers}</span>
                  )}
                  {metadata.analysis.engagement_metrics.engagement_rate && (
                    <span><strong>Engagement:</strong> {(metadata.analysis.engagement_metrics.engagement_rate * 100).toFixed(1)}%</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
