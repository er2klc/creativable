import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { LeadWithRelations, SocialMediaPost } from "../types/lead";

interface LeadTimelineProps {
  lead: LeadWithRelations;
}

export const LeadTimeline = ({ lead }: LeadTimelineProps) => {
  const { settings } = useSettings();
  const [activeTimeline, setActiveTimeline] = useState<'activities' | 'social'>('activities');
  
  // Check if lead was created via Apify (has social media data)
  const showSocialTimeline = Array.isArray(lead.social_media_posts) && lead.social_media_posts.length > 0;

  // Create contact creation timeline item
  const contactCreationItem = {
    id: 'contact-creation',
    type: 'contact_created',
    content: `Kontakt ${lead.name} wurde erstellt`,
    created_at: lead.created_at,
    timestamp: lead.created_at,
    metadata: {
      type: 'contact_created'
    }
  };

  // Sort notes in reverse chronological order (newest first)
  const sortedNotes = (lead.notes || [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Add contact creation item at the end (it will appear at the bottom)
  const timelineItems = [...sortedNotes, contactCreationItem];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {settings?.language === "en" ? "Activities" : "Aktivitäten"}
        </h3>
        {showSocialTimeline && (
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${
                activeTimeline === 'activities' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
              onClick={() => setActiveTimeline('activities')}
            >
              Timeline
            </button>
            <button
              className={`px-3 py-1 rounded ${
                activeTimeline === 'social' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
              onClick={() => setActiveTimeline('social')}
            >
              Social Media
            </button>
          </div>
        )}
      </div>

      {activeTimeline === 'activities' ? (
        <div className="relative space-y-6">
          <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-400" />
          {timelineItems.map((item) => (
            <div key={item.id} className="flex gap-4 ml-4">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-white border-2 border-gray-400" />
              </div>
              <div className="flex-1">
                <p>{item.content}</p>
                <span className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(lead.social_media_posts || []).map((post: SocialMediaPost) => (
            <div key={post.id} className="border rounded p-4">
              <p>{post.content}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>{post.likes_count} likes</span>
                <span>{post.comments_count} comments</span>
                {post.location && <span>{post.location}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};