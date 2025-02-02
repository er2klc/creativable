import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPost } from "../types/lead";

export const useSocialMediaPosts = (leadId: string) => {
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSocialMediaPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("social_media_posts")
          .select("*")
          .eq("lead_id", leadId);

        if (error) throw error;

        setSocialMediaPosts(data as SocialMediaPost[]);
      } catch (err) {
        setError("Error fetching social media posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaPosts();
  }, [leadId]);

  return { socialMediaPosts, loading, error };
};
