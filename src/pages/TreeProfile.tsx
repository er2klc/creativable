import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-gray-800/50 border-gray-700">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Avatar className="h-24 w-24">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
            ) : (
              <AvatarFallback className="bg-gray-700 text-white">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h1 className="text-2xl font-bold text-white">@{profile.username}</h1>
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
                className="w-full text-center py-6 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                {link.title}
              </Button>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TreeProfile;