import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SignatureForm } from "@/components/tools/signature/SignatureForm";
import { SignaturePreview } from "@/components/tools/signature/SignaturePreview";
import { SignatureTemplateSelector } from "@/components/tools/signature/SignatureTemplateSelector";
import { SignatureData, Template } from "@/types/signature";

const SignatureGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("modern");
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: "",
    position: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    linkedIn: "",
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">E-Mail Signatur Generator</h1>
        <p className="text-muted-foreground mt-2">
          Erstelle eine professionelle E-Mail-Signatur in wenigen Schritten.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <SignatureTemplateSelector 
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
          <SignatureForm 
            signatureData={signatureData}
            onChange={setSignatureData}
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
  );
};

export default SignatureGenerator;