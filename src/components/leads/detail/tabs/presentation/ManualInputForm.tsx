import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManualInputFormProps {
  title: string;
  url: string;
  onTitleChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  type: string;
}

export const ManualInputForm = ({
  title,
  url,
  onTitleChange,
  onUrlChange,
  type
}: ManualInputFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Titel (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Video Titel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={`${type === "youtube" ? "YouTube" : type} URL`}
        />
      </div>
    </>
  );
};