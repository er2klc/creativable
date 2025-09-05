
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardPeriod } from "@/hooks/leaderboard/useLeaderboardData";

interface LeaderboardTabsProps {
  currentPeriod: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
}

export function LeaderboardTabs({ currentPeriod, onPeriodChange }: LeaderboardTabsProps) {
  return (
    <Tabs value={currentPeriod} onValueChange={(value) => onPeriodChange(value as LeaderboardPeriod)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="7days">7 Tage</TabsTrigger>
        <TabsTrigger value="30days">30 Tage</TabsTrigger>
        <TabsTrigger value="alltime">Allzeit</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
