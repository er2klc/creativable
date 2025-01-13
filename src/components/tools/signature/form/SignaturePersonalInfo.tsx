import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const handleFontChange = (value: string) => {
    onChange({
      ...data,
      font: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={data.name}
            onChange={handleChange("name")}
            placeholder="Max Mustermann"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={data.position}
            onChange={handleChange("position")}
            placeholder="Marketing Manager"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company">Unternehmen</Label>
          <Input
            id="company"
            value={data.company}
            onChange={handleChange("company")}
            placeholder="Musterfirma GmbH"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={handleChange("email")}
            placeholder="max@musterfirma.de"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={handleChange("phone")}
            placeholder="+49 123 456789"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Webseite</Label>
          <Input
            id="website"
            value={data.website}
            onChange={handleChange("website")}
            placeholder="www.musterfirma.de"
            className="bg-white/5 backdrop-blur-sm border-white/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font">Schriftart</Label>
        <Select value={data.font} onValueChange={handleFontChange}>
          <SelectTrigger>
            <SelectValue placeholder="Wähle eine Schriftart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};