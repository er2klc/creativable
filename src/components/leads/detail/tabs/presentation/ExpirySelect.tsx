import { Label } from "@/components/ui/label";

interface ExpirySelectProps {
  expiresIn: string;
  onChange: (value: string) => void;
}

export const ExpirySelect = ({ expiresIn, onChange }: ExpirySelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="expires">URL gültig für</Label>
      <select
        id="expires"
        value={expiresIn}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        <option value="never">Unbegrenzt</option>
        <option value="1day">1 Tag</option>
        <option value="7days">7 Tage</option>
        <option value="30days">30 Tage</option>
      </select>
    </div>
  );
};