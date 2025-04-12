
import { Platform } from "@/config/platforms";

interface SocialTimelineProps {
  platform: Platform;
  hasLinkedInPosts: boolean;
  linkedInPosts: any[];
  socialMediaPosts: any[];
  leadId: string;
}

export const SocialTimeline = ({ 
  platform, 
  hasLinkedInPosts,
  linkedInPosts = [],
  socialMediaPosts = [],
  leadId
}: SocialTimelineProps) => {
  // Choose which posts to display based on platform and availability
  const postsToDisplay = hasLinkedInPosts ? linkedInPosts : socialMediaPosts;

  return (
    <div className="space-y-6">
      {postsToDisplay.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">Keine Social Media Aktivitäten gefunden.</p>
        </div>
      ) : (
        postsToDisplay.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(post, null, 2)}
            </pre>
          </div>
        ))
      )}
    </div>
  );
};
