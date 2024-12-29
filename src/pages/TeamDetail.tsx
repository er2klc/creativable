import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Infinity, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${teamId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const updateLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const logoUrl = await uploadLogo(file);
      const { error } = await supabase
        .from('teams')
        .update({ logo_url: logoUrl })
        .eq('id', teamId);

      if (error) throw error;
      return logoUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      toast.success("Team Logo erfolgreich aktualisiert");
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error) => {
      console.error("Error updating team logo:", error);
      toast.error("Fehler beim Aktualisieren des Team Logos");
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      updateLogoMutation.mutate(logoFile);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Infinity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-['Orbitron'] text-primary">
            {team.name}
          </h1>
        </div>
        <button
          onClick={() => navigate('/unity')}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Zurück zur Übersicht
        </button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Team Logo</h2>
            <div className="flex flex-col items-center gap-4">
              {logoPreview ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
                  <img
                    src={logoPreview}
                    alt="Team logo preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 bg-background/80 hover:bg-background"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                  >
                    ×
                  </Button>
                </div>
              ) : team.logo_url ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="flex gap-2">
                <Label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Logo auswählen
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </Label>
                {logoFile && (
                  <Button
                    onClick={handleLogoUpload}
                    disabled={updateLogoMutation.isPending}
                  >
                    {updateLogoMutation.isPending ? "Lädt hoch..." : "Speichern"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Team management content will be implemented in the next iteration */}
        <Card>
          <CardContent className="p-6">
            <p>Team Management Funktionen werden hier implementiert...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamDetail;