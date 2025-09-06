import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignatureData } from "@/types/signature";

export const useSignatureActions = () => {
  const { toast } = useToast();

  const saveSignature = async (signatureData: SignatureData, selectedTemplate: string) => {
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
          youtube: signatureData.youtube,
          twitter: signatureData.twitter,
          whatsapp: signatureData.whatsapp,
          xing: signatureData.xing,
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

  return { saveSignature };
};