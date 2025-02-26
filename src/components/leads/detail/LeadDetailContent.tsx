
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { LeadTimeline } from "./LeadTimeline";
import { LeadSummary } from "./LeadSummary";
import { LeadAvatar } from "./card/LeadAvatar";
import { LeadSocialStats } from "./card/LeadSocialStats";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface LeadDetailContentProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  isLoading: boolean;
  onDeleteClick?: () => void;
  onDeletePhaseChange?: (noteId: string) => void;
}

export const LeadDetailContent = ({ 
  lead, 
  onUpdateLead,
  isLoading,
  onDeleteClick,
  onDeletePhaseChange
}: LeadDetailContentProps) => {
  const { settings } = useSettings();
  const [isScanning, setIsScanning] = useState(false);

  const handleScanProfile = async () => {
    if (!lead.social_media_username) {
      toast.error(settings?.language === "en" 
        ? "No social media username found"
        : "Kein Social Media Benutzername gefunden"
      );
      return;
    }

    setIsScanning(true);
    try {
      // API-Aufruf hier...
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliert API-Aufruf
      toast.success(settings?.language === "en"
        ? "Profile updated successfully"
        : "Profil erfolgreich aktualisiert"
      );
    } catch (error) {
      toast.error(settings?.language === "en"
        ? "Error updating profile"
        : "Fehler beim Aktualisieren des Profils"
      );
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-6 mt-32">
        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Linke Spalte - 4 Cols */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <LeadSummary lead={lead} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {/* Social Media Header */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex items-start gap-4">
                  <LeadAvatar
                    imageUrl={lead.social_media_profile_image_url}
                    name={lead.name}
                    platform={lead.platform}
                    avatarSize="xl"
                  />
                  <div className="flex-1 pt-2">
                    <div className="font-medium text-lg flex items-center justify-between">
                      <span>{lead.social_media_username || lead.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleScanProfile}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <LeadSocialStats
                      followers={lead.social_media_followers}
                      following={lead.social_media_following}
                      engagement_rate={lead.social_media_engagement_rate}
                      isTeamOwner={true}
                    />
                  </div>
                </div>
                {lead.social_media_bio && (
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {lead.social_media_bio}
                  </div>
                )}
              </div>

              {/* Basic Information Fields */}
              <BasicInformationFields 
                lead={lead}
                onUpdate={onUpdateLead}
              />
            </div>
          </div>

          {/* Rechte Spalte - 8 Cols */}
          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <LeadDetailTabs lead={lead} />
            </div>
            {/* Timeline ohne weißen Hintergrund */}
            <LeadTimeline 
              lead={lead} 
              onDeletePhaseChange={onDeletePhaseChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
