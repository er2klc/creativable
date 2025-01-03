import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { DeleteUnitButton } from "./DeleteUnitButton";

interface LearningUnit {
  id: string;
  title: string;
  completed: boolean;
}

interface LearningUnitTabsProps {
  units: LearningUnit[];
  activeUnit: string;
  onUnitChange: (unitId: string) => void;
  isAdmin?: boolean;
  onUnitDeleted?: () => void;
}

export const LearningUnitTabs = ({ 
  units, 
  activeUnit, 
  onUnitChange,
  isAdmin,
  onUnitDeleted
}: LearningUnitTabsProps) => {
  return (
    <TabsList className="w-full justify-start bg-white/50 backdrop-blur-sm p-1 rounded-lg mb-6 border">
      {units.map((unit, index) => (
        <TabsTrigger
          key={unit.id}
          value={unit.id}
          className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative py-2 px-4"
          onClick={() => onUnitChange(unit.id)}
        >
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/5 text-primary">
              {index + 1}
            </span>
            {unit.title}
          </span>
          <div className="flex items-center gap-1">
            {unit.completed && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {isAdmin && (
              <DeleteUnitButton 
                lerninhalteId={unit.id}
                onDelete={() => onUnitDeleted?.()}
              />
            )}
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};