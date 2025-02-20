import { TeamDataProvider } from "../context/TeamDataProvider";
import { TabsContent } from "@/components/ui/tabs";
import { MembersCard } from "./snap-cards/MembersCard";
import { CalendarDays, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  teamSlug: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const TeamSnaps = ({ 
  isAdmin,
  isManaging,
  teamId,
  teamSlug,
  onCalendarClick,
  onSnapClick,
  onBack,
  activeSnapView
}: TeamSnapsProps) => {
  return (
    <TeamDataProvider teamId={teamId}>
      <TabsContent value="posts" className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MembersCard teamId={teamId} teamSlug={teamSlug} />
          {isAdmin && isManaging && (
            <Card className="border-2 border-dashed border-primary/50 rounded-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <CalendarDays className="h-10 w-10 text-primary mb-4" />
                <p className="text-lg font-semibold text-primary mb-2">
                  Kalender Snap
                </p>
                <p className="text-sm text-muted-foreground">
                  Erstelle einen Kalender Snap
                </p>
              </CardContent>
            </Card>
          )}
          {isAdmin && isManaging && (
            <Card className="border-2 border-dashed border-primary/50 rounded-lg">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <p className="text-lg font-semibold text-primary mb-2">
                  Mitglieder Snap
                </p>
                <p className="text-sm text-muted-foreground">
                  Erstelle einen Mitglieder Snap
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </TeamDataProvider>
  );
};
