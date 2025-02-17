
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelCardProps {
  level: number;
  membersCount: number;
  totalMembers: number;
  isUnlocked?: boolean;
  rewards?: {
    reward_name: string;
    reward_description: string | null;
    icon_name: string | null;
  }[];
  icon: LucideIcon;
  label: string;
  minPoints: number;
  maxPoints: number;
}

const getLevelColor = (level: number) => {
  const colors = {
    0: "bg-gray-100 border-gray-200",
    1: "bg-[#F1F0FB] border-[#E5E4F3]",
    2: "bg-[#D3E4FD] border-[#C2D3EC]",
    3: "bg-[#E5DEFF] border-[#D4CDE8]",
    4: "bg-[#FDE1D3] border-[#ECCFC2]",
    5: "bg-[#FFDEE2] border-[#EBD0D4]",
    6: "bg-[#FFE4C4] border-[#EDC9A3]",
    7: "bg-[#E6E6FA] border-[#D8D8F0]",
    8: "bg-[#98FB98] border-[#90EE90]",
    9: "bg-[#DDA0DD] border-[#D8BFD8]",
    10: "bg-[#FFD700] border-[#DAA520]"
  };
  return colors[level as keyof typeof colors] || colors[0];
};

export function LevelCard({ 
  level, 
  membersCount, 
  totalMembers, 
  isUnlocked = true, 
  rewards = [],
  icon: Icon,
  label,
  minPoints,
  maxPoints
}: LevelCardProps) {
  const percentage = totalMembers > 0 ? (membersCount / totalMembers) * 100 : 0;
  
  return (
    <Card className={cn(
      "relative p-4 transition-all",
      getLevelColor(level),
      !isUnlocked && "opacity-50"
    )}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Level {level}</div>
          <Icon className="h-6 w-6" />
        </div>
        
        <Progress value={percentage} className="h-2" />
        
        <div className="text-sm text-muted-foreground">
          {membersCount} Mitglieder ({Math.round(percentage)}%)
        </div>

        <div className="text-xs font-medium text-muted-foreground">
          {label} ({minPoints} - {maxPoints} Punkte)
        </div>
        
        {rewards.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="text-xs font-medium mb-1">Belohnungen:</div>
            {rewards.map((reward, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                • {reward.reward_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
