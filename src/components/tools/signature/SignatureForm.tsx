import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";

interface SignatureFormProps {
  signatureData: SignatureData;
  onChange: (data: SignatureData) => void;
}

export const SignatureForm = ({ signatureData, onChange }: SignatureFormProps) => {
  const handleChange = (field: keyof SignatureData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...signatureData,
      [field]: e.target.value,
    });
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={signatureData.name}
          onChange={handleChange("name")}
          placeholder="Max Mustermann"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={signatureData.position}
          onChange={handleChange("position")}
          placeholder="Marketing Manager"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Unternehmen</Label>
        <Input
          id="company"
          value={signatureData.company}
          onChange={handleChange("company")}
          placeholder="Musterfirma GmbH"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={signatureData.email}
          onChange={handleChange("email")}
          placeholder="max@musterfirma.de"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefon</Label>
        <Input
          id="phone"
          value={signatureData.phone}
          onChange={handleChange("phone")}
          placeholder="+49 123 456789"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={signatureData.website}
          onChange={handleChange("website")}
          placeholder="www.musterfirma.de"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedIn">LinkedIn</Label>
        <Input
          id="linkedIn"
          value={signatureData.linkedIn}
          onChange={handleChange("linkedIn")}
          placeholder="linkedin.com/in/maxmustermann"
        />
      </div>
    </div>
  );
};