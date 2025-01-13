import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";

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
    </div>
  );
};