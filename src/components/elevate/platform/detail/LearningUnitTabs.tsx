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
    <div className="relative mb-6 bg-gray-100 rounded-t-md">
      <Tabs 
        value={activeUnit} 
        className="w-full" 
        onValueChange={onUnitChange}
        defaultValue={units[0]?.id}
      >
        <TabsList className="h-auto p-1 flex-wrap w-full justify-start bg-gray-200/50">
          {units.map((unit, index) => (
            <TabsTrigger
              key={unit.id}
              value={unit.id}
              className={cn(
                "relative data-[state=active]:text-primary data-[state=active]:bg-white min-w-[3rem]",
                unit.completed && "text-green-600"
              )}
              title={unit.title}
            >
              <span className="font-medium">{index + 1}</span>
              {unit.completed && (
                <CheckCircle className="w-3 h-3 ml-1 inline-block text-green-600" />
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