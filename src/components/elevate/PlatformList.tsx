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
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-[280px] w-full" />
        ))}
      </div>
    );
  }

  if (platforms.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-900/95 via-gray-900 to-gray-900/95 rounded-lg p-8">
        <p className="text-muted-foreground">
          Keine Module gefunden. Erstellen Sie ein neues Modul oder treten Sie einem bestehenden bei.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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