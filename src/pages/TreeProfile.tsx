import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar className="h-24 w-24">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
          ) : (
            <AvatarFallback>{profile.username[0].toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <h1 className="text-2xl font-bold">@{profile.username}</h1>
      </div>

      <div className="space-y-4">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full text-center py-6"
            >
              {link.title}
            </Button>
          </a>
        ))}
      </div>
    </div>
  );
};

export default TreeProfile;