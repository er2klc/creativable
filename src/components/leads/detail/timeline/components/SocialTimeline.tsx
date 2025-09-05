import { LinkedInTimeline } from "../social/LinkedInTimeline";
import { SocialMediaTimeline } from "../social/SocialMediaTimeline";

interface SocialTimelineProps {
  platform?: string;
  hasLinkedInPosts: boolean;
  linkedInPosts: any[];
  socialMediaPosts: any[];
  leadId: string;
}

export const SocialTimeline = ({ 
  platform,
  hasLinkedInPosts,
  linkedInPosts,
  socialMediaPosts,
  leadId
}: SocialTimelineProps) => {
  if (platform === 'LinkedIn' && hasLinkedInPosts) {
    return <LinkedInTimeline posts={linkedInPosts} />;
  }

  return (
    <SocialMediaTimeline 
      posts={socialMediaPosts}
      linkedInPosts={linkedInPosts}
      platform={platform}
      kontaktIdFallback={leadId}
    />
  );
};