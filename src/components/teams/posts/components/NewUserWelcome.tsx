
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wave } from "lucide-react";

interface NewUserWelcomeProps {
  onIntroductionClick: () => void;
}

export const NewUserWelcome = ({ onIntroductionClick }: NewUserWelcomeProps) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Wave className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Willkommen in der Community!</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Bevor du Beiträge erstellen kannst, stell dich bitte kurz der Community vor.
          Das hilft allen Mitgliedern, sich besser kennenzulernen und in Kontakt zu kommen.
        </p>
        <Button onClick={onIntroductionClick} size="lg" className="mt-2">
          Jetzt vorstellen
        </Button>
      </div>
    </Card>
  );
};
