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
      console.info("Loading saved bio data...");
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        console.error("No user ID found");
        return;
      }

      const { data, error } = await supabase
        .from("user_bios")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading bio:", error.message, error.hint);
        throw error;
      }

      if (data) {
        console.info("Found saved bio data:", data);
        setSavedFormData({
          role: data.role || "",
          target_audience: data.target_audience || "",
          unique_strengths: data.unique_strengths || "",
          mission: data.mission || "",
          social_proof: data.social_proof || "",
          cta_goal: data.cta_goal || "",
          url: data.url || "",
          preferred_emojis: data.preferred_emojis || "",
          language: data.language || "Deutsch",
        });
        setGeneratedBio(data.generated_bio || "");
      } else {
        console.info("No saved bio data found");
      }
    } catch (error) {
      console.error("Error loading bio:", error);
      toast({
        title: "Fehler",
        description: "Bio konnte nicht geladen werden.",
        variant: "destructive",
      });
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
      console.info("Generating bio with values:", values);
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("No access token found");
        throw new Error("Authentication required");
      }

      // Generate bio using edge function with proper authentication
      const { data: bioData, error: bioError } = await supabase.functions.invoke(
        "generate-bio",
        {
          body: values,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (bioError) {
        console.error("Bio generation error:", bioError);
        throw bioError;
      }

      if (!bioData?.bio) {
        console.error("No bio data received");
        throw new Error("No bio was generated");
      }

      // Save to database
      const { error: saveError } = await supabase
        .from("user_bios")
        .upsert({
          user_id: session.user.id,
          ...values,
          generated_bio: bioData.bio,
          updated_at: new Date().toISOString()
        });

      if (saveError) {
        console.error("Error saving bio:", saveError);
        throw saveError;
      }

      setGeneratedBio(bioData.bio);
      setSavedFormData(values);

      toast({
        title: "Bio generiert",
        description: "Ihre Bio wurde erfolgreich erstellt.",
      });
    } catch (error: any) {
      console.error("Error generating bio:", error);
      toast({
        title: "Fehler",
        description: error.message || "Bio konnte nicht generiert werden. Bitte versuchen Sie es später erneut.",
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
        <h1 className="text-3xl font-bold">Bio Generator</h1>
        <p className="text-muted-foreground mt-2">
          Erstellen Sie eine professionelle Bio mit KI-Unterstützung.
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