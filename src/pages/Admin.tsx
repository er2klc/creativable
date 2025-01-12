import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const Admin = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [changelogData, setChangelogData] = useState({
    version: "",
    title: "",
    description: "",
  });

  const handleChangelogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('changelog_entries')
        .insert({
          version: changelogData.version,
          title: changelogData.title,
          description: changelogData.description,
          created_by: session?.user?.id,
          status: 'published'
        });

      if (error) throw error;

      toast.success("Changelog Eintrag erfolgreich erstellt");
      setChangelogData({ version: "", title: "", description: "" });
    } catch (error: any) {
      console.error('Error creating changelog:', error);
      toast.error(error.message || "Fehler beim Erstellen des Changelog Eintrags");
    } finally {
      setIsLoading(false);
    }
  };

  const processPersonalData = async () => {
    try {
      console.log("Starting personal data processing for user:", session?.user?.id);
      
      const { data: settings } = await supabase
        .from('settings')
        .select('openai_api_key')
        .eq('user_id', session?.user?.id)
        .single();

      if (!settings?.openai_api_key) {
        toast.error("Bitte fügen Sie zuerst Ihren OpenAI API-Schlüssel in den Einstellungen hinzu");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/populate-team-embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: session?.user?.id,
            processPersonalData: true 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Verarbeiten der persönlichen Daten");
      }

      const result = await response.json();
      console.log("Personal data processing result:", result);
      toast.success("Verarbeitung der persönlichen Daten wurde gestartet");
    } catch (error) {
      console.error('Error processing personal data:', error);
      toast.error("Fehler beim Verarbeiten der persönlichen Daten");
    }
  };

  const processTeamData = async () => {
    try {
      console.log("Starting team data processing for user:", session?.user?.id);
      
      const { data: settings } = await supabase
        .from('settings')
        .select('openai_api_key')
        .eq('user_id', session?.user?.id)
        .single();

      if (!settings?.openai_api_key) {
        toast.error("Bitte fügen Sie zuerst Ihren OpenAI API-Schlüssel in den Einstellungen hinzu");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/populate-team-embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: session?.user?.id,
            processTeamData: true 
          })
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Verarbeiten der Team-Daten");
      }

      const result = await response.json();
      console.log("Team data processing result:", result);
      toast.success("Verarbeitung der Team-Daten wurde gestartet");
    } catch (error) {
      console.error('Error processing team data:', error);
      toast.error("Fehler beim Verarbeiten der Team-Daten");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <Card className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Changelog Eintrag erstellen</h2>
        <form onSubmit={handleChangelogSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Version</label>
            <Input
              value={changelogData.version}
              onChange={(e) => setChangelogData(prev => ({ ...prev, version: e.target.value }))}
              placeholder="z.B. 1.0.0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Titel</label>
            <Input
              value={changelogData.title}
              onChange={(e) => setChangelogData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titel des Updates"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <Textarea
              value={changelogData.description}
              onChange={(e) => setChangelogData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung der Änderungen"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Wird gespeichert..." : "Changelog Eintrag erstellen"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Datenverarbeitung</h2>
        <div className="flex gap-4">
          <Button onClick={processPersonalData}>
            Persönliche Daten verarbeiten
          </Button>
          <Button onClick={processTeamData}>
            Team-Daten verarbeiten
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Admin;