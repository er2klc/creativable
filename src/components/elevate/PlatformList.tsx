import { PlatformCard } from "./card/PlatformCard";
import { Skeleton } from "@/components/ui/skeleton";

interface PlatformListProps {
  platforms: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const PlatformList = ({ platforms, isLoading, onDelete }: PlatformListProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[140px] w-full" />
        ))}
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Keine Plattformen gefunden. Erstellen Sie eine neue Plattform, um loszulegen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1">
      {platforms.map((platform) => (
        <PlatformCard
          key={platform.id}
          platform={platform}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};