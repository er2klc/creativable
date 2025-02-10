
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface DescriptionFieldProps {
  description: string;
  setDescription: (description: string) => void;
}

export const DescriptionField = ({ description, setDescription }: DescriptionFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="description">Beschreibung</Label>
    <TiptapEditor
      content={description}
      onChange={setDescription}
    />
  </div>
);
