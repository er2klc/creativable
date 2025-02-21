
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, Lock } from "lucide-react";
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
    8: "bg-[#F2FCE2] border-[#E2ECD2]",
    9: "bg-[#FEF7CD] border-[#EEE7BD]",
    10: "bg-[#FEC6A1] border-[#EEB691]"
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
      "relative p-3 transition-all",
      getLevelColor(level),
      !isUnlocked && "opacity-75"
    )}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <div className="font-medium text-sm">Level {level}</div>
          </div>
          {!isUnlocked && (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        
        <Progress value={percentage} className="h-1.5" />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <div className="flex flex-col items-end">
            <span>{membersCount} ({Math.round(percentage)}%)</span>
            <span className="text-xs text-muted-foreground">
              {level === 10 ? 
                `Ab ${minPoints.toLocaleString()} Punkte` : 
                `${minPoints.toLocaleString()}-${maxPoints.toLocaleString()} Punkte`}
            </span>
          </div>
        </div>

        {rewards.length > 0 && (
          <div className="mt-1 pt-1 border-t border-border/50">
            <div className="text-xs text-muted-foreground line-clamp-1">
              {rewards[0].reward_name}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
