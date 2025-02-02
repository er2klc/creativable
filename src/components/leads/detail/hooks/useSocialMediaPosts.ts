import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SocialMediaPost } from "@/types/leads";
import { transformApifyPost, transformSocialMediaPost } from "./social-media/transformers";
import { ApifyPost } from "./social-media/types";

export const useSocialMediaPosts = (leadId: string) => {
  return useQuery({
    queryKey: ["social-media-posts", leadId],
    queryFn: async () => {
      console.log(`🚀 API wird für Lead ID: ${leadId} ausgeführt`);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      // Fetch social media posts
      const { data: socialMediaPosts, error: postsError } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("lead_id", leadId)
        .eq("user_id", user.id)
        .order("posted_at", { ascending: false });

      if (postsError) {
        console.error("⚠️ Fehler beim Abrufen der Social Media Posts:", postsError);
        throw postsError;
      }

      // Fetch lead data for Apify Instagram data
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .select("apify_instagram_data")
        .eq("id", leadId)
        .single();

      if (leadError) {
        console.error("⚠️ Fehler beim Abrufen der Lead-Daten:", leadError);
        throw leadError;
      }

      // Parse Apify data
      let apifyPosts: ApifyPost[] = [];
      if (leadData?.apify_instagram_data) {
        try {
          apifyPosts = Array.isArray(leadData.apify_instagram_data) 
            ? leadData.apify_instagram_data 
            : typeof leadData.apify_instagram_data === 'string'
              ? JSON.parse(leadData.apify_instagram_data)
              : [];
        } catch (e) {
          console.error("⚠️ Fehler beim Parsen von apify_instagram_data:", e);
        }
      }

      // Transform posts
      const mergedPosts = socialMediaPosts.map(post => 
        transformSocialMediaPost(post, apifyPosts)
      );

      // Add video posts from Apify data if they don't exist in social media posts
      apifyPosts.forEach((apifyPost) => {
        const existsInMerged = mergedPosts.some((p) => p.id === apifyPost.id);
        if (!existsInMerged && apifyPost.videoUrl) {
          const transformedPost = transformApifyPost(apifyPost, user.id, leadId);
          if (Object.keys(transformedPost).length > 0) {
            mergedPosts.push(transformedPost as SocialMediaPost);
          }
        }
      });

      return mergedPosts;
    },
    enabled: !!leadId,
  });
};