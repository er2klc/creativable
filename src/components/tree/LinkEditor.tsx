import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { TreeLink } from "@/integrations/supabase/types/database";

interface LinkEditorProps {
  links: TreeLink[];
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, field: keyof TreeLink, value: string) => void;
  onSaveLinks: () => void;
}

export const LinkEditor = ({
  links,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
  onSaveLinks
}: LinkEditorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Links</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddLink}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      <div className="space-y-4">
        {links.map((link, index) => (
          <div key={index} className="space-y-2">
            <Input
              placeholder="Link Title"
              value={link.title}
              onChange={(e) => onUpdateLink(index, "title", e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
            <div className="flex gap-2">
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => onUpdateLink(index, "url", e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onRemoveLink(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {links.length > 0 && (
        <Button
          onClick={onSaveLinks}
          className="w-full bg-white/10 hover:bg-white/20 text-white"
        >
          Save Links
        </Button>
      )}
    </div>
  );
};