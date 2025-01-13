import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { User, Briefcase, Building, Mail, Phone, Globe } from "lucide-react";

interface SignaturePersonalInfoProps {
  data: SignatureData;
  onChange: (data: SignatureData) => void;
}

export const SignaturePersonalInfo = ({ data, onChange }: SignaturePersonalInfoProps) => {
  const handleChange = (field: keyof SignatureData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...data,
      [field]: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Name
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={handleChange("name")}
            placeholder="Max Mustermann"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Position
          </Label>
          <Input
            id="position"
            value={data.position}
            onChange={handleChange("position")}
            placeholder="Marketing Manager"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Unternehmen
          </Label>
          <Input
            id="company"
            value={data.company}
            onChange={handleChange("company")}
            placeholder="Musterfirma GmbH"
          />
        </div>

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
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          />
        </div>
      </div>
    </div>
  );
};