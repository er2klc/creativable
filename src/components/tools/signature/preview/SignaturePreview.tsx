import { Button } from "@/components/ui/button";
import { SignatureData, Template } from "@/types/signature";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ModernTemplate, ClassicTemplate, MinimalTemplate } from "./SignatureTemplates";
import { getSocialIcon, formatSocialUrl } from "./utils";

interface SignaturePreviewProps {
  template: Template;
  data: SignatureData;
}

export const SignaturePreview = ({ template, data }: SignaturePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const getTemplateHtml = () => {
    const props = { data, getSocialIcon, formatSocialUrl };
    
    switch (template) {
      case "modern":
        return ModernTemplate(props);
      case "classic":
        return ClassicTemplate(props);
      case "minimal":
        return MinimalTemplate(props);
      default:
        return "";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getTemplateHtml());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy signature:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vorschau</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Kopiert
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              HTML kopieren
            </>
          )}
        </Button>
      </div>
      
      <div className="border rounded-lg p-6 w-full overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: getTemplateHtml() }} />
      </div>
    </div>
  );
};