import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { TreeLink } from "@/pages/TreeGenerator";

interface LinksSectionProps {
  profile: any;
  links: TreeLink[];
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, field: keyof TreeLink, value: string) => void;
  onSaveLinks: () => Promise<void>;
}

export const LinksSection: React.FC<LinksSectionProps> = ({
  profile,
  links,
  onAddLink,
  onRemoveLink,
  onUpdateLink,
  onSaveLinks,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label>Your Links</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddLink}
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
            />
            <div className="flex gap-2">
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => onUpdateLink(index, "url", e.target.value)}
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
          className="w-full"
        >
          Save Links
        </Button>
      )}
    </>
  );
};