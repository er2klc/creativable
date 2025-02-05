import { Card } from "@/components/ui/card";
import { Youtube } from "lucide-react";
import { UserLink } from "@/pages/Links";

interface LinkSelectionFormProps {
  userLinks: UserLink[];
  selectedUrl: string;
  onLinkSelect: (link: UserLink) => void;
}

export const LinkSelectionForm = ({
  userLinks,
  selectedUrl,
  onLinkSelect
}: LinkSelectionFormProps) => {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {userLinks.map((link) => (
        <Card
          key={link.id}
          className={`p-3 cursor-pointer hover:bg-gray-100 ${
            selectedUrl === link.url ? "border-2 border-primary" : ""
          }`}
          onClick={() => onLinkSelect(link)}
        >
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-600" />
            <div>
              <p className="font-medium">{link.title}</p>
              <p className="text-sm text-muted-foreground">{link.url}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};