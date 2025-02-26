
import { Bot, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { formatDateTime } from "../utils/dateUtils";

interface NexusTimelineCardProps {
  content: string;
  metadata: {
    type: string;
    timestamp: string;
    phase_name?: string;
    analysis?: {
      summary?: string;
      key_points?: string[];
      recommendations?: string[];
    };
  };
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function NexusTimelineCard({
  content,
  metadata,
  onRegenerate,
  isRegenerating
}: NexusTimelineCardProps) {
  const { settings } = useSettings();

  return (
    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 shadow-sm border border-blue-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <Bot className="h-5 w-5 text-blue-500 mt-1" />
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {formatDateTime(metadata.timestamp, settings?.language)}
            </p>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-900">{content}</p>
              {metadata.analysis && (
                <div className="mt-4 space-y-4">
                  {metadata.analysis.summary && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {settings?.language === "en" ? "Summary" : "Zusammenfassung"}
                      </h4>
                      <p className="text-gray-700">{metadata.analysis.summary}</p>
                    </div>
                  )}
                  {metadata.analysis.key_points && metadata.analysis.key_points.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {settings?.language === "en" ? "Key Points" : "Kernpunkte"}
                      </h4>
                      <ul className="list-disc pl-4 text-gray-700">
                        {metadata.analysis.key_points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {metadata.analysis.recommendations && metadata.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {settings?.language === "en" ? "Recommendations" : "Empfehlungen"}
                      </h4>
                      <ul className="list-disc pl-4 text-gray-700">
                        {metadata.analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
}
