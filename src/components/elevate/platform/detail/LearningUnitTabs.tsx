import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onUnitDeleted?: () => Promise<void>;
  onCreateUnit?: () => void;
}

export const LearningUnitTabs = ({
  units,
  activeUnit,
  onUnitChange,
  isAdmin,
  onUnitDeleted,
  onCreateUnit
}: LearningUnitTabsProps) => {
  return (
    <div className="relative">
      <Tabs defaultValue={activeUnit} className="w-full" onValueChange={onUnitChange}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="h-auto p-1 flex-wrap">
            {units.map((unit) => (
              <TabsTrigger
                key={unit.id}
                value={unit.id}
                className={cn(
                  "relative data-[state=active]:text-primary",
                  unit.completed && "text-green-600"
                )}
              >
                {unit.title}
                {unit.completed && (
                  <CheckCircle className="w-4 h-4 ml-2 inline-block text-green-600" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {isAdmin && (
            <Button
              onClick={onCreateUnit}
              size="sm"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Lerneinheit
            </Button>
          )}
        </div>
      </Tabs>
    </div>
  );
};