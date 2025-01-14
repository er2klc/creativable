import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { NoApiKeyAlert } from "@/components/bio-generator/NoApiKeyAlert";
import { BioGeneratorForm } from "@/components/bio-generator/BioGeneratorForm";
import { BioPreview } from "@/components/bio-generator/BioPreview";

const BioGenerator = () => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [generatedBio, setGeneratedBio] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBio = async (values: any) => {
    if (!settings?.openai_api_key) {
      toast({
        title: "API-Key fehlt",
        description: "Bitte hinterlegen Sie Ihren OpenAI API-Key in den Einstellungen.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bio", {
        body: JSON.stringify(values),
      });

      if (error) throw error;
      setGeneratedBio(data.bio);
      toast({
        title: "Bio generiert",
        description: "Ihre Instagram-Bio wurde erfolgreich erstellt.",
      });
    } catch (error) {
      console.error("Error generating bio:", error);
      toast({
        title: "Fehler",
        description: "Bio konnte nicht generiert werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!settings?.openai_api_key) {
    return <NoApiKeyAlert />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Instagram Bio Generator</h1>
        <p className="text-muted-foreground mt-2">
          Erstellen Sie eine professionelle Instagram-Bio mit KI-Unterstützung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BioGeneratorForm onSubmit={generateBio} isGenerating={isGenerating} />
        <BioPreview generatedBio={generatedBio} />
      </div>
    </div>
  );
};

export default BioGenerator;