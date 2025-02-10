
import { Switch } from "@/components/ui/switch";
import { Lock, Unlock } from "lucide-react";

interface VisibilityToggleProps {
  isPublic: boolean;
  onPublicChange: (value: boolean) => void;
}

export const VisibilityToggle = ({
  isPublic,
  onPublicChange,
}: VisibilityToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
        <span>Öffentlich</span>
      </div>
      <Switch
        checked={isPublic}
        onCheckedChange={onPublicChange}
      />
    </div>
  );
};
