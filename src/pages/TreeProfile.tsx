import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TreePreview } from "@/components/tree/TreePreview";

interface TreeLink {
  id: string;
  title: string;
  url: string;
  order_index: number;
}

interface TreeProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  slug: string;
  bio: string | null;
}

const TreeProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<TreeProfile | null>(null);
  const [links, setLinks] = useState<TreeLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [slug]);

  const loadProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("tree_profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (profile) {
        setProfile(profile);

        const { data: links } = await supabase
          .from("tree_links")
          .select("*")
          .eq("profile_id", profile.id)
          .order("order_index");

        if (links) {
          setLinks(links);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        Profile not found
      </div>
    );
  }

  return (
    <TreePreview
      username={profile.username}
      avatarUrl={profile.avatar_url}
      bio={profile.bio}
      links={links}
    />
  );
};

export default TreeProfile;