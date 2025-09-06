
import { Card } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card className="p-6">
      <div className="text-center text-muted-foreground">
        Keine Beiträge gefunden
      </div>
    </Card>
  );
};
