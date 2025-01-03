import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  progress: number;
}

export const LearningUnitTabs = ({
  units,
  activeUnit,
  onUnitChange,
  isAdmin,
  onCreateUnit,
}: LearningUnitTabsProps) => {
  return (
    <Tabs 
      value={activeUnit} 
      className="w-full" 
      onValueChange={onUnitChange}
      defaultValue={units[0]?.id}
    >
      <TabsList className="h-auto p-1 flex-wrap w-full justify-start bg-gray-200/50 border-b border-gray-200">
        {units.map((unit, index) => (
          <>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-1 p-0 h-5 hover:bg-green-100 text-green-600"
                >
                  ✓
                </Button>
              )}
            </TabsTrigger>
            {index < units.length - 1 && (
              <div className="h-4 w-px bg-gray-300 mx-1" />
            )}
          </>
        ))}
        {isAdmin && onCreateUnit && (
          <TabsTrigger
            value="new"
            onClick={onCreateUnit}
            className="bg-primary/10 hover:bg-primary/20 text-primary data-[state=active]:bg-primary/20"
          >
            +
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  );
};