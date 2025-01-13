import { Label } from "@/components/ui/label";
import { SignatureData } from "@/types/signature";
import { Input } from "@/components/ui/input";

interface SignatureColorSettingsProps {
  data: SignatureData;
  onChange: (data: SignatureData) => void;
}

export const SignatureColorSettings = ({ data, onChange }: SignatureColorSettingsProps) => {
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
      <h3 className="text-lg font-semibold">Design</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="themeColor">Theme Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="themeColor"
              value={data.themeColor}
              onChange={handleChange("themeColor")}
              className="w-12 h-12 p-1"
            />
            <Input
              type="text"
              value={data.themeColor}
              onChange={handleChange("themeColor")}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="textColor">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="textColor"
              value={data.textColor}
              onChange={handleChange("textColor")}
              className="w-12 h-12 p-1"
            />
            <Input
              type="text"
              value={data.textColor}
              onChange={handleChange("textColor")}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkColor">Link Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="linkColor"
              value={data.linkColor}
              onChange={handleChange("linkColor")}
              className="w-12 h-12 p-1"
            />
            <Input
              type="text"
              value={data.linkColor}
              onChange={handleChange("linkColor")}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};