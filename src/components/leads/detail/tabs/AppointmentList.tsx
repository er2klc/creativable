import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { Calendar } from "lucide-react";

interface AppointmentListProps {
  leadId: string;
}

export function AppointmentList({ leadId }: AppointmentListProps) {
  const { settings } = useSettings();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}