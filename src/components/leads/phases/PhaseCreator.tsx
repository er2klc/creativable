import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface PhaseCreatorProps {
  onAddPhase: (name: string) => void;
}

export const PhaseCreator = ({ onAddPhase }: PhaseCreatorProps) => {
  const [newPhaseName, setNewPhaseName] = useState("");
  const { settings } = useSettings();

  return (
    <div className="flex gap-2">
      <Input
        placeholder={settings?.language === "en" ? "New phase name" : "Name der neuen Phase"}
        value={newPhaseName}
        onChange={(e) => setNewPhaseName(e.target.value)}
      />
      <Button
        onClick={() => {
          onAddPhase(newPhaseName);
          setNewPhaseName("");
        }}
        disabled={!newPhaseName.trim()}
      >
        <Plus className="h-4 w-4 mr-2" />
        {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
      </Button>
    </div>
  );
};