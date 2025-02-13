
import { Lock } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import type { SocialMediaPost } from "@/types/leads";
import { SocialMediaPost as SocialMediaPostComponent } from "./SocialMediaPost";

interface SocialMediaTimelineProps {
  posts: SocialMediaPost[];
  linkedInPosts?: any[];
  platform?: string;
  kontaktIdFallback?: string;
  isPrivate?: boolean;
}

export const SocialMediaTimeline = ({ 
  posts, 
  linkedInPosts, 
  platform, 
  kontaktIdFallback,
  isPrivate 
}: SocialMediaTimelineProps) => {
  const { settings } = useSettings();

  if (isPrivate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-50 rounded-full p-4 mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {settings?.language === "en" ? "Private Account" : "Privates Profil"}
        </h3>
        <p className="text-gray-500 max-w-md">
          {settings?.language === "en" 
            ? "This is a private Instagram account. We respect the user's privacy settings and cannot display their social media activity."
            : "Dies ist ein privates Instagram-Profil. Wir respektieren die Privatsphäre-Einstellungen und können keine Social Media Aktivitäten anzeigen."}
        </p>
      </div>
    );
  }

  const sortedPosts = [...posts]
    .sort((a, b) => {
      const dateA = a.posted_at ? new Date(a.posted_at) : new Date();
      const dateB = b.posted_at ? new Date(b.posted_at) : new Date();
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-400 z-0" />
      <div className="space-y-6">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <SocialMediaPostComponent
              key={post.id}
              post={post}
              kontaktIdFallback={kontaktIdFallback}
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4 ml-4">
            Keine Social Media Aktivitäten vorhanden
          </div>
        )}
      </div>
    </div>
  );
};
