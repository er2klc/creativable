import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PresentationTabProps {
  leadId: string;
  type: string;
  tabColors?: any;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function PresentationTab({ leadId, type, tabColors, isOpen, onOpenChange }: PresentationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Präsentation - {type}</CardTitle>
        <CardDescription>
          Erstellen und verwalten Sie Präsentationen für diesen Lead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Die Präsentations-Funktion ist temporär deaktiviert, während wir an Verbesserungen arbeiten.
          </p>
          <Button disabled variant="outline">
            Präsentation erstellen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}