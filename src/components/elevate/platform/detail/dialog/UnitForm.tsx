import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface UnitFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
}

export const UnitForm = ({
  title,
  setTitle,
  description,
  setDescription,
  videoUrl,
  setVideoUrl,
}: UnitFormProps) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="title">Titel</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Beschreibung</Label>
      <RichTextEditor
        content={description}
        onChange={setDescription}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="videoUrl">Video URL</Label>
      <Input
        id="videoUrl"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full"
      />
    </div>
  </>
);