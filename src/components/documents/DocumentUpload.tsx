import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleUpload = async () => {
    if (!file || !title) {
      toast.error("Bitte wählen Sie eine Datei aus und geben Sie einen Titel ein.");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Nicht eingeloggt");
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('sourceType', file.type);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-document`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Hochladen des Dokuments");
      }

      toast.success("Dokument erfolgreich hochgeladen");
      setFile(null);
      setTitle("");

      // Trigger a refresh of the timeline
      window.dispatchEvent(new CustomEvent('refreshTimeline'));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Fehler beim Hochladen: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokument hochladen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Titel</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dokumenttitel"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Datei</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !file || !title}
        >
          {isUploading ? "Wird hochgeladen..." : "Hochladen"}
        </Button>
      </CardContent>
    </Card>
  );
}