import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { InstagramPostCard } from "./social-media/InstagramPostCard";

interface LeadTimelineProps {
  lead: Tables<"leads">;
}

export function LeadTimeline({ lead }: LeadTimelineProps) {
  const { data: posts } = useQuery({
    queryKey: ["social-media-posts", lead.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", lead.id)
        .order("posted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <InstagramPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}