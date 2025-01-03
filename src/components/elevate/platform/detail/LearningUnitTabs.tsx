import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  onCreateUnit?: () => void;
}

export const LearningUnitTabs = ({
  units,
  activeUnit,
  onUnitChange,
  isAdmin,
  onCreateUnit
}: LearningUnitTabsProps) => {
  return (
    <div className="relative mb-6 bg-muted rounded-md">
      <Tabs 
        value={activeUnit} 
        className="w-full" 
        onValueChange={onUnitChange}
        defaultValue={units[0]?.id}
      >
        <TabsList className="h-auto p-1 flex-wrap w-full justify-start">
          {units.map((unit, index) => (
            <TabsTrigger
              key={unit.id}
              value={unit.id}
              className={cn(
                "relative data-[state=active]:text-primary truncate max-w-[200px] text-left",
                unit.completed && "text-green-600"
              )}
              title={unit.title}
            >
              <span className="truncate">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {unit.title}
              </span>
              {unit.completed && (
                <CheckCircle className="w-4 h-4 ml-2 shrink-0 inline-block text-green-600" />
              )}
            </TabsTrigger>
          ))}
          {isAdmin && onCreateUnit && (
            <TabsTrigger
              value="new"
              onClick={onCreateUnit}
              className="bg-primary/10 hover:bg-primary/20 text-primary data-[state=active]:bg-primary/20"
            >
              <Plus className="w-5 h-5" />
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>
    </div>
  );
};