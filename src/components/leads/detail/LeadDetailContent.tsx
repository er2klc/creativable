
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { LeadWithRelations } from "@/types/leads";
import { LeadDetailTabs } from "./LeadDetailTabs";
import { LeadTimeline } from "./LeadTimeline";
import { LeadSummary } from "./LeadSummary";
import { LeadAvatar } from "./card/LeadAvatar";
import { LeadSocialStats } from "./card/LeadSocialStats";

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

  if (isLoading) {
    return <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-6 mt-32">
        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Linke Spalte - 5 Cols */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <LeadSummary lead={lead} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              {/* Social Media Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <LeadAvatar
                    imageUrl={lead.social_media_profile_image_url}
                    name={lead.name}
                    platform={lead.platform}
                    avatarSize="lg"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-lg">
                      <span>{lead.social_media_username || lead.name}</span>
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
                  <>
                    <div className="h-px w-full bg-gray-200 my-4" />
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {lead.social_media_bio}
                    </div>
                  </>
                )}
                <div className="h-px w-full bg-gray-200" />
              </div>

              {/* Basic Information Fields */}
              <BasicInformationFields 
                lead={lead}
                onUpdate={onUpdateLead}
              />
            </div>
          </div>

          {/* Rechte Spalte - 7 Cols */}
          <div className="col-span-7 space-y-6">
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
