
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Shield, Star, MessageCircle, Users } from "lucide-react";
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
}

const getLevelColor = (level: number) => {
  switch (level) {
    case 1: return "bg-[#F1F0FB] border-[#E5E4F3]";
    case 2: return "bg-[#D3E4FD] border-[#C2D3EC]";
    case 3: return "bg-[#E5DEFF] border-[#D4CDE8]";
    case 4: return "bg-[#FDE1D3] border-[#ECCFC2]";
    case 5: return "bg-[#FFDEE2] border-[#EBD0D4]";
    default: return "bg-gray-100 border-gray-200";
  }
};

const getLevelIcon = (level: number) => {
  switch (level) {
    case 1: return <MessageCircle className="h-6 w-6" />;
    case 2: return <Users className="h-6 w-6" />;
    case 3: return <Shield className="h-6 w-6" />;
    case 4: return <Star className="h-6 w-6" />;
    case 5: return <Trophy className="h-6 w-6" />;
    default: return <Star className="h-6 w-6" />;
  }
};

export function LevelCard({ level, membersCount, totalMembers, isUnlocked = true, rewards = [] }: LevelCardProps) {
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
          {getLevelIcon(level)}
        </div>
        
        <Progress value={percentage} className="h-2" />
        
        <div className="text-sm text-muted-foreground">
          {membersCount} Mitglieder ({Math.round(percentage)}%)
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
