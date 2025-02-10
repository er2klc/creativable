
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NameFieldProps {
  name: string;
  setName: (name: string) => void;
}

export const NameField = ({ name, setName }: NameFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Name der Plattform"
    />
  </div>
);
