import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Globe } from "lucide-react";
import { SignatureData } from "@/types/signature";

interface SignatureContactInfoProps {
  data: SignatureData;
  onChange: (data: SignatureData) => void;
}

export const SignatureContactInfo = ({ data, onChange }: SignatureContactInfoProps) => {
  const handleChange = (field: keyof SignatureData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          E-Mail
        </Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={handleChange("email")}
          placeholder="max@musterfirma.de"
          className="bg-white/5 backdrop-blur-sm border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Telefon
        </Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={handleChange("phone")}
          placeholder="+49 123 456789"
          className="bg-white/5 backdrop-blur-sm border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Website
        </Label>
        <Input
          id="website"
          value={data.website}
          onChange={handleChange("website")}
          placeholder="www.musterfirma.de"
          className="bg-white/5 backdrop-blur-sm border-white/10"
        />
      </div>
    </div>
  );
};