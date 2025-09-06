import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ChangelogForm = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [changelogData, setChangelogData] = useState({
    version: "",
    title: "",
    description: "",
    status: "planned" as "planned" | "in-progress" | "completed"
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
          status: changelogData.status
        });

      if (error) throw error;

      toast.success("Changelog Eintrag erfolgreich erstellt");
      setChangelogData({ version: "", title: "", description: "", status: "planned" });
    } catch (error: any) {
      console.error('Error creating changelog:', error);
      toast.error(error.message || "Fehler beim Erstellen des Changelog Eintrags");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/40 border-none shadow-lg backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white">Changelog Eintrag erstellen</CardTitle>
        <CardDescription className="text-gray-300">
          Erstelle einen neuen Changelog Eintrag für die Benutzer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangelogSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Version</label>
            <Input
              value={changelogData.version}
              onChange={(e) => setChangelogData(prev => ({ ...prev, version: e.target.value }))}
              placeholder="z.B. 1.0.0"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Titel</label>
            <Input
              value={changelogData.title}
              onChange={(e) => setChangelogData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titel des Updates"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
            <Select
              value={changelogData.status}
              onValueChange={(value: "planned" | "in-progress" | "completed") => 
                setChangelogData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="bg-black/20 border-white/10 text-white">
                <SelectValue placeholder="Wähle einen Status" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10">
                <SelectItem value="planned" className="text-white">📅 Geplant</SelectItem>
                <SelectItem value="in-progress" className="text-white">⚡ In Arbeit</SelectItem>
                <SelectItem value="completed" className="text-white">✓ Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Beschreibung</label>
            <Textarea
              value={changelogData.description}
              onChange={(e) => setChangelogData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Beschreibung der Änderungen"
              className="bg-black/20 border-white/10 text-white"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            {isLoading ? "Wird gespeichert..." : "Changelog Eintrag erstellen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};