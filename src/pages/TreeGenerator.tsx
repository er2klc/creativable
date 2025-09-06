import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TreePreview } from "@/components/tree/TreePreview";
import { IconSelector } from "@/components/tree/IconSelector";
import { TreeGeneratorHeader } from "@/components/tree/generator/TreeGeneratorHeader";
import { ProfileSection } from "@/components/tree/generator/ProfileSection";
import { LinksSection } from "@/components/tree/generator/LinksSection";
import { PublicUrlSection } from "@/components/tree/generator/PublicUrlSection";
import { ArrowDown, ArrowUp } from "lucide-react";

export interface TreeLink {
  id?: string;
  title: string;
  url: string;
  order_index: number;
}

const TreeGenerator = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [links, setLinks] = useState<TreeLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from("tree_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profile) {
        setProfile(profile);
        setUsername(profile.username);
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url);
        setLogoPreview(profile.avatar_url);

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
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;

    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      if (profile) {
        const { error: updateError } = await supabase
          .from("tree_profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", profile.id);

        if (updateError) throw updateError;

        setAvatarUrl(avatarUrl);
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const handleAvatarRemove = async () => {
    if (profile && avatarUrl) {
      try {
        const { error: updateError } = await supabase
          .from("tree_profiles")
          .update({ avatar_url: null })
          .eq("id", profile.id);

        if (updateError) throw updateError;

        setAvatarUrl(null);
        setLogoPreview(null);
        toast({
          title: "Success",
          description: "Profile picture removed successfully",
        });
      } catch (error) {
        console.error("Error removing avatar:", error);
        toast({
          title: "Error",
          description: "Failed to remove profile picture",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!profile) {
        const { data, error } = await supabase
          .from("tree_profiles")
          .insert({ 
            user_id: user?.id, 
            username,
            bio,
            slug: username.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          })
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
        toast({
          title: "Success",
          description: "Profile created successfully",
        });
      } else {
        const { error } = await supabase
          .from("tree_profiles")
          .update({ username, bio })
          .eq("id", profile.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  const addLink = () => {
    setLinks([
      ...links,
      { title: "", url: "", order_index: links.length },
    ]);
  };

  const removeLink = async (index: number) => {
    const linkToRemove = links[index];
    if (linkToRemove.id) {
      try {
        const { error } = await supabase
          .from("tree_links")
          .delete()
          .eq("id", linkToRemove.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error removing link:", error);
        toast({
          title: "Error",
          description: "Failed to remove link",
          variant: "destructive",
        });
        return;
      }
    }

    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const updateLink = (index: number, field: keyof TreeLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const saveLinks = async () => {
    if (!profile) return;

    try {
      const { data: existingLinks } = await supabase
        .from("tree_links")
        .select("id")
        .eq("profile_id", profile.id);

      const currentLinkIds = new Set(links.filter(l => l.id).map(l => l.id));
      const linksToDelete = existingLinks?.filter(link => !currentLinkIds.has(link.id)) || [];

      if (linksToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("tree_links")
          .delete()
          .eq("profile_id", profile.id)
          .in("id", linksToDelete.map(l => l.id));

        if (deleteError) throw deleteError;
      }

      for (const link of links) {
        if (link.id) {
          const { error } = await supabase
            .from("tree_links")
            .update({
              title: link.title,
              url: link.url,
              order_index: link.order_index,
            })
            .eq("id", link.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("tree_links")
            .insert({
              profile_id: profile.id,
              title: link.title,
              url: link.url,
              order_index: link.order_index,
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Links saved successfully",
      });

      loadProfile();
    } catch (error) {
      console.error("Error saving links:", error);
      toast({
        title: "Error",
        description: "Failed to save links",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/2 space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tree Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create your personalized link page
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <ProfileSection
            username={username}
            bio={bio}
            avatarUrl={avatarUrl}
            logoPreview={logoPreview}
            onUsernameChange={setUsername}
            onBioChange={setBio}
            onAvatarChange={handleAvatarChange}
            onAvatarRemove={handleAvatarRemove}
            onSaveProfile={handleSaveProfile}
          />

          <LinksSection
            profile={profile}
            links={links}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            onUpdateLink={updateLink}
            onSaveLinks={saveLinks}
          />

          <div className="flex justify-center gap-4 text-muted-foreground">
            <ArrowUp className="h-5 w-5" />
            <ArrowDown className="h-5 w-5" />
          </div>

          <PublicUrlSection profile={profile} />
        </Card>
      </div>

      <div className="w-full lg:w-1/2 sticky top-4 h-full">
        <TreePreview 
          username={username}
          avatarUrl={logoPreview || avatarUrl}
          bio={bio}
          links={links}
        />
        <IconSelector />
      </div>
    </div>
  );
};

export default TreeGenerator;
