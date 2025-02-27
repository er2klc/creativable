
import { cn } from "@/lib/utils";
import { Bot, Copy, RefreshCw, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import ReactMarkdown from 'react-markdown';
import { Badge } from "@/components/ui/badge";

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
    phaseInfo?: {
      position: string;
      index: number;
      total: number;
      positionLabel: string;
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
    <div className="rounded-lg relative p-[1px] bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white rounded-[7px] p-4 space-y-4">
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
          </div>
        </div>

        {metadata.phaseInfo && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
              {metadata.phaseInfo.position === "first" ? (
                <ChevronLeft className="h-3 w-3" />
              ) : metadata.phaseInfo.position === "last" ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <>
                  <ChevronLeft className="h-3 w-3" />
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
              <span>
                {metadata.phaseInfo.positionLabel} ({metadata.phaseInfo.index + 1}/{metadata.phaseInfo.total})
              </span>
            </Badge>
          </div>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>

        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
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
          <div className="pt-4 border-t">
            <div className="space-y-2 text-xs text-muted-foreground">
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
          </div>
        )}
      </div>
    </div>
  );
};
