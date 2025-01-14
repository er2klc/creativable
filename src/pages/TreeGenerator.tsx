import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ProfileImageUpload } from "@/components/tree/ProfileImageUpload";
import { LinkEditor } from "@/components/tree/LinkEditor";
import { PublicUrlDisplay } from "@/components/tree/PublicUrlDisplay";
import { TreeLink } from "@/integrations/supabase/types/database";

const TreeGenerator = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
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

    // Create a preview URL
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
          .update({ username })
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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      <Card className="relative w-full max-w-[450px] bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Tree Generator</h1>
          <p className="text-sm text-gray-400">
            Create your personalized link page
          </p>
        </div>

        <div className="space-y-6">
          <ProfileImageUpload
            avatarUrl={avatarUrl}
            onAvatarChange={handleAvatarChange}
            onAvatarRemove={handleAvatarRemove}
            logoPreview={logoPreview}
          />

          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            className="w-full bg-white/10 hover:bg-white/20 text-white"
          >
            Save Profile
          </Button>
        </div>

        {profile && (
          <>
            <LinkEditor
              links={links}
              onAddLink={addLink}
              onRemoveLink={removeLink}
              onUpdateLink={updateLink}
              onSaveLinks={saveLinks}
            />

            {profile.slug && <PublicUrlDisplay slug={profile.slug} />}
          </>
        )}
      </Card>
    </div>
  );
};

export default TreeGenerator;