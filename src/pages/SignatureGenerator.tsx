import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SignatureForm } from "@/components/tools/signature/SignatureForm";
import { SignaturePreview } from "@/components/tools/signature/SignaturePreview";
import { SignatureTemplateSelector } from "@/components/tools/signature/SignatureTemplateSelector";
import { SignatureData, Template } from "@/types/signature";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const SignatureGenerator = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("modern");
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: "",
    position: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
    whatsapp: "",
    logoUrl: null,
    themeColor: "#f86295",
    textColor: "#000000",
    linkColor: "#7075db",
    font: "Arial",
    fontSize: "medium",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: existingSignature } = useQuery({
    queryKey: ['signature-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_signatures')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching signature:', error);
        toast({
          title: "Fehler beim Laden",
          description: "Deine Signatur konnte nicht geladen werden.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
  });

  useEffect(() => {
    if (existingSignature) {
      setSignatureData({
        name: existingSignature.name,
        position: existingSignature.position || "",
        company: existingSignature.company || "",
        email: existingSignature.email || "",
        phone: existingSignature.phone || "",
        website: existingSignature.website || "",
        linkedin: existingSignature.linkedin || "",
        instagram: existingSignature.instagram || "",
        tiktok: existingSignature.tiktok || "",
        youtube: existingSignature.youtube || "",
        twitter: existingSignature.twitter || "",
        whatsapp: existingSignature.whatsapp || "",
        logoUrl: existingSignature.logo_url,
        themeColor: existingSignature.theme_color || "#f86295",
        textColor: existingSignature.text_color || "#000000",
        linkColor: existingSignature.link_color || "#7075db",
        font: existingSignature.font || "Arial",
        fontSize: existingSignature.font_size || "medium",
      });
      setSelectedTemplate(existingSignature.template as Template);
    }
  }, [existingSignature]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('team-logos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(fileName);

      setSignatureData(prev => ({
        ...prev,
        logoUrl: publicUrl
      }));

      toast({
        title: "Logo hochgeladen",
        description: "Dein Logo wurde erfolgreich hochgeladen.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Das Logo konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    }
  };

  const handleLogoRemove = () => {
    setSignatureData(prev => ({
      ...prev,
      logoUrl: null
    }));
    setLogoPreview(null);
  };

  const saveSignature = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_signatures')
        .upsert({
          user_id: user.id,
          name: signatureData.name,
          position: signatureData.position,
          company: signatureData.company,
          email: signatureData.email,
          phone: signatureData.phone,
          website: signatureData.website,
          linkedin: signatureData.linkedin,
          instagram: signatureData.instagram,
          tiktok: signatureData.tiktok,
          youtube: signatureData.youtube,
          twitter: signatureData.twitter,
          whatsapp: signatureData.whatsapp,
          logo_url: signatureData.logoUrl,
          template: selectedTemplate,
          theme_color: signatureData.themeColor,
          text_color: signatureData.textColor,
          link_color: signatureData.linkColor,
          font: signatureData.font,
          font_size: signatureData.fontSize,
        });

      if (error) throw error;

      toast({
        title: "Signatur gespeichert",
        description: "Deine Signatur wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error saving signature:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Signatur konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">E-Mail Signatur Generator</h1>
        <p className="text-muted-foreground mt-2">
          Erstelle eine professionelle E-Mail-Signatur in wenigen Schritten.
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <SignatureTemplateSelector 
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <SignatureForm 
              signatureData={signatureData}
              onChange={setSignatureData}
              onLogoChange={handleLogoChange}
              onLogoRemove={handleLogoRemove}
              logoPreview={logoPreview}
              onSave={saveSignature}
            />
          </Card>

          <Card className="p-6">
            <SignaturePreview 
              template={selectedTemplate}
              data={signatureData}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignatureGenerator;