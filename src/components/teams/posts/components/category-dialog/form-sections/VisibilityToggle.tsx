
import { Switch } from "@/components/ui/switch";
import { Lock, Unlock } from "lucide-react";
import { Label } from "@/components/ui/label";

interface VisibilityToggleProps {
  isPublic: boolean;
  onChange: (value: boolean) => void;
}

export const VisibilityToggle = ({
  isPublic,
  onChange,
}: VisibilityToggleProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPublic ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          <div className="space-y-1">
            <Label>Beiträge erstellen</Label>
            <p className="text-sm text-muted-foreground">
              {isPublic 
                ? "Alle Teammitglieder können Beiträge erstellen" 
                : "Nur Admins können Beiträge erstellen"}
            </p>
          </div>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  );
};
