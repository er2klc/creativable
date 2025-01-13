import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase, Mail, Phone, Globe } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
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
            className="bg-white/5 backdrop-blur-sm border-white/10"
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
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Unternehmen
          </Label>
          <Input
            id="company"
            value={data.company}
            onChange={handleChange("company")}
            placeholder="Musterfirma GmbH"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
            Webseite
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
    </div>
  );
};