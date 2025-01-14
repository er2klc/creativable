import { useState, useEffect } from "react";
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
  const [savedFormData, setSavedFormData] = useState(null);

  useEffect(() => {
    loadSavedBio();
  }, []);

  const loadSavedBio = async () => {
    try {
      const { data, error } = await supabase
        .from('user_bios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setSavedFormData(data);
        setGeneratedBio(data.generated_bio || "");
      }
    } catch (error) {
      console.error("Error loading bio:", error);
    }
  };

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
      const { data: bioData, error: bioError } = await supabase.functions.invoke("generate-bio", {
        body: JSON.stringify(values),
      });

      if (bioError) throw bioError;

      // Save the form data and generated bio
      const { error: saveError } = await supabase
        .from('user_bios')
        .upsert({
          ...values,
          generated_bio: bioData.bio,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (saveError) throw saveError;

      setGeneratedBio(bioData.bio);
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

  const regenerateBio = async () => {
    if (savedFormData) {
      await generateBio(savedFormData);
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
        <BioGeneratorForm 
          onSubmit={generateBio} 
          isGenerating={isGenerating}
          initialData={savedFormData}
        />
        <BioPreview 
          generatedBio={generatedBio} 
          onRegenerate={regenerateBio}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default BioGenerator;