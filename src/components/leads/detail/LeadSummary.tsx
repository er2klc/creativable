
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  MessageCircle,
  SaveIcon,
  Check,
  RefreshCw,
  PenIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadWithRelations } from "@/types/leads";
import { Tables } from "@/integrations/supabase/types";

interface LeadSummaryProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const LeadSummary = ({ lead, onUpdateLead }: LeadSummaryProps) => {
  const [summary, setSummary] = useState(lead.summary || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { settings } = useSettings();
  const session = useSession();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  useEffect(() => {
    setSummary(lead.summary || "");
  }, [lead.summary]);

  const generateSummary = async () => {
    if (!session?.user?.id) {
      toast.error(
        settings?.language === "en"
          ? "Please log in to generate a summary"
          : "Bitte melden Sie sich an, um eine Zusammenfassung zu generieren"
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Function to generate summary using OpenAI or similar service
      const { data, error } = await supabase.functions.invoke(
        "generate-lead-summary",
        {
          body: { leadId: lead.id, userId: session.user.id },
        }
      );

      if (error) {
        throw error;
      }

      if (data.summary) {
        setSummary(data.summary);
        onUpdateLead({ summary: data.summary });
        queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
        queryClient.invalidateQueries({
          queryKey: ["lead-with-relations", lead.id],
        });
        toast.success(
          settings?.language === "en"
            ? "Summary generated successfully"
            : "Zusammenfassung erfolgreich generiert"
        );
      } else {
        toast.error(
          settings?.language === "en"
            ? "Failed to generate summary"
            : "Fehler bei der Generierung der Zusammenfassung"
        );
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(
        settings?.language === "en"
          ? "Error generating summary"
          : "Fehler bei der Generierung der Zusammenfassung"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLead({ summary });
      setIsEditing(false);
      toast.success(
        settings?.language === "en"
          ? "Summary saved successfully"
          : "Zusammenfassung erfolgreich gespeichert"
      );
    } catch (error) {
      console.error("Error saving summary:", error);
      toast.error(
        settings?.language === "en"
          ? "Error saving summary"
          : "Fehler beim Speichern der Zusammenfassung"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle>
            {settings?.language === "en" ? "Lead Summary" : "Lead Zusammenfassung"}
          </CardTitle>
          <CardDescription>
            {settings?.language === "en"
              ? "Key information about this lead"
              : "Wichtige Informationen zu diesem Lead"}
          </CardDescription>
          {lead.phase_id && (
            <Badge
              variant="outline"
              className="mt-1 border-blue-200 bg-blue-50 text-blue-700"
            >
              {lead.phase_name || "No Phase"}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Toggle
            aria-label={
              settings?.language === "en" ? "Edit summary" : "Zusammenfassung bearbeiten"
            }
            pressed={isEditing}
            onPressedChange={setIsEditing}
          >
            <PenIcon className="h-4 w-4" />
          </Toggle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateSummary}
            disabled={isGenerating}
            className="h-8"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1" />
            )}
            <span className={isMobile ? "sr-only" : ""}>
              {settings?.language === "en"
                ? "Generate"
                : "Generieren"}
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[150px] text-sm"
              placeholder={
                settings?.language === "en"
                  ? "Add a summary about this lead..."
                  : "Fügen Sie eine Zusammenfassung über diesen Lead hinzu..."
              }
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSummary(lead.summary || "");
                  setIsEditing(false);
                }}
              >
                {settings?.language === "en" ? "Cancel" : "Abbrechen"}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-1"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <SaveIcon className="h-4 w-4" />
                )}
                <span>
                  {settings?.language === "en" ? "Save" : "Speichern"}
                </span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {summary ? (
              <div className="whitespace-pre-line text-sm">
                {summary}
              </div>
            ) : (
              <div className="text-sm italic text-gray-500">
                {settings?.language === "en"
                  ? "No summary available. Click 'Generate' to create one automatically or 'Edit' to write your own."
                  : "Keine Zusammenfassung verfügbar. Klicken Sie auf 'Generieren', um automatisch eine zu erstellen, oder auf 'Bearbeiten', um Ihre eigene zu schreiben."}
              </div>
            )}
          </div>
        )}

        {lead.messages && lead.messages.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center text-sm text-gray-500">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>
              {settings?.language === "en"
                ? `${lead.messages.length} messages`
                : `${lead.messages.length} Nachrichten`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
