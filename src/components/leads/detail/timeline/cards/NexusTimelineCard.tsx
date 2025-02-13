
import { cn } from "@/lib/utils";
import { Bot, Copy, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface NexusTimelineCardProps {
  content: string;
  metadata: {
    type: string;
    analysis?: {
      social_media_bio?: string;
      hashtags?: string[];
      engagement_metrics?: {
        followers?: number;
        engagement_rate?: number;
      };
    };
    template_type?: string;
    phase?: {
      id: string;
      name: string;
    };
    generated_at?: string;
  };
  onDelete?: () => void;
}

export const NexusTimelineCard = ({ content, metadata, onDelete }: NexusTimelineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Nachricht in die Zwischenablage kopiert");
    } catch (err) {
      toast.error("Fehler beim Kopieren der Nachricht");
    }
  };

  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 space-y-2",
      "hover:border-primary/20 transition-all"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4" />
          <span>Nexus AI</span>
          {metadata.template_type && (
            <>
              <span>•</span>
              <span className="capitalize">{metadata.template_type}</span>
            </>
          )}
          {metadata.phase?.name && (
            <>
              <span>•</span>
              <span>{metadata.phase.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      <div className="text-sm whitespace-pre-wrap">
        {content}
      </div>

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
