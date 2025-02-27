
import { useState } from "react";
import { Bot, Copy, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CallScriptGeneratorProps {
  leadId: string;
  leadName: string;
  leadPlatform: string;
  leadIndustry?: string;
  existingAnalysis?: string;
}

export function CallScriptGenerator({ 
  leadId, 
  leadName, 
  leadPlatform,
  leadIndustry = "",
  existingAnalysis = ""
}: CallScriptGeneratorProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [scriptType, setScriptType] = useState<"introduction" | "follow_up" | "closing">("introduction");

  const generateCallScript = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Get user's display name to include in script
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
        
      const userName = profileData?.display_name || 'Sie';

      // Get lead data
      const { data: leadData } = await supabase
        .from('leads')
        .select(`
          *,
          social_media_posts:social_media_posts(content, platform, posted_at, likes_count, comments_count),
          notes:notes(content, created_at)
        `)
        .eq('id', leadId)
        .single();

      const requestData = {
        leadId,
        userName,
        scriptType,
        leadData,
        existingAnalysis,
        settings
      };

      const { data, error } = await supabase.functions.invoke('generate-call-script', {
        body: requestData
      }).catch(err => {
        console.error("Error calling function:", err);
        
        // Fallback to direct OpenAI call if Edge function fails
        return generateScriptFallback(requestData);
      });

      if (error) throw error;

      const scriptContent = data?.script || "Could not generate script";
      setGeneratedScript(scriptContent);

      // Save the script to the database as a note
      await supabase
        .from('notes')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          content: scriptContent,
          metadata: { 
            type: 'call_script',
            script_type: scriptType,
            generated_at: new Date().toISOString()
          }
        });

      toast.success(
        settings?.language === "en"
          ? "Call script generated successfully"
          : "Telefonscript erfolgreich erstellt"
      );
    } catch (error: any) {
      console.error("Error generating call script:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating script: ${error.message || "Please try again"}`
          : `Fehler bei der Erstellung des Scripts: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback function if the edge function is not available
  const generateScriptFallback = async (requestData: any) => {
    // This is just a placeholder - in a real implementation, 
    // this would directly call the OpenAI API with proper error handling
    return {
      data: {
        script: `# Telefonscript für ${leadName}\n\n## Einleitung\n- Hallo, mein Name ist ${requestData.userName}...\n\n## Hauptteil\n- Ich habe gesehen, dass Sie im Bereich ${leadIndustry} tätig sind...\n\n## Abschluss\n- Vielen Dank für Ihre Zeit...`
      }
    };
  };

  const copyToClipboard = async () => {
    if (!generatedScript) return;
    
    try {
      await navigator.clipboard.writeText(generatedScript);
      toast.success(
        settings?.language === "en"
          ? "Script copied to clipboard"
          : "Script in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Error copying script"
          : "Fehler beim Kopieren des Scripts"
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          {settings?.language === "en" ? "Call Script Generator" : "Telefonscript Generator"}
        </CardTitle>
        <CardDescription>
          {settings?.language === "en"
            ? "Generate a personalized call script based on contact data and analysis"
            : "Erstellen Sie ein personalisiertes Telefonscript basierend auf Kontaktdaten und Analyse"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={scriptType} onValueChange={(v) => setScriptType(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="introduction" className="flex-1">
              {settings?.language === "en" ? "Introduction" : "Erstgespräch"}
            </TabsTrigger>
            <TabsTrigger value="follow_up" className="flex-1">
              {settings?.language === "en" ? "Follow-up" : "Folgegespräch"}
            </TabsTrigger>
            <TabsTrigger value="closing" className="flex-1">
              {settings?.language === "en" ? "Closing" : "Abschluss"}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!generatedScript ? (
          <Button
            onClick={generateCallScript}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {settings?.language === "en" ? "Generating..." : "Generiere..."}
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Generate Call Script" : "Telefonscript erstellen"}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg prose prose-sm max-w-none">
              <ReactMarkdown>{generatedScript}</ReactMarkdown>
            </div>
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Copy to Clipboard" : "In Zwischenablage kopieren"}
              </Button>
              <Button 
                onClick={() => {
                  setGeneratedScript(null);
                  generateCallScript();
                }} 
                variant="outline"
                disabled={isGenerating}
              >
                <Bot className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Regenerate" : "Neu erstellen"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
