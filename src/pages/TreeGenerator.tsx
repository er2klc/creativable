import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TreeLink {
  id?: string;
  title: string;
  url: string;
  order_index: number;
}

const TreeGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [links, setLinks] = useState<TreeLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        // For new profiles, the slug will be generated automatically by the database trigger
        const { data, error } = await supabase
          .from("tree_profiles")
          .insert({ 
            user_id: user?.id, 
            username,
            slug: username.toLowerCase().replace(/[^a-z0-9]+/g, '-') // Provide initial slug
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

      loadProfile(); // Reload to get the updated links with IDs
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
    <div className="container max-w-md mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Tree Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create your personalized link page
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="h-32 w-32 mx-auto">
              <TeamLogoUpload
                currentLogoUrl={avatarUrl}
                onLogoChange={handleAvatarChange}
                onLogoRemove={handleAvatarRemove}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            className="w-full"
          >
            Save Profile
          </Button>
        </div>

        {profile && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Your Links</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-4">
                {links.map((link, index) => (
                  <div key={index} className="space-y-2">
                    <Input
                      placeholder="Link Title"
                      value={link.title}
                      onChange={(e) => updateLink(index, "title", e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => updateLink(index, "url", e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {links.length > 0 && (
                <Button
                  onClick={saveLinks}
                  className="w-full"
                >
                  Save Links
                </Button>
              )}
            </div>

            {profile.slug && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Your public URL:</p>
                <p className="text-sm font-mono break-all">
                  {window.location.origin}/tree/{profile.slug}
                </p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default TreeGenerator;