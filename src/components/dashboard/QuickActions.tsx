
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShortcutDialog } from "./ShortcutDialog";

export function QuickActions() {
  const navigate = useNavigate();
  const [showShortcutDialog, setShowShortcutDialog] = useState(false);

  const quickActions = [
    {
      title: "Neuer Lead",
      description: "Fügen Sie einen neuen Kontakt hinzu",
      icon: PlusCircle,
      action: () => navigate("/leads"),
      color: "text-blue-600"
    },
    {
      title: "Termin planen",
      description: "Neuen Termin im Kalender erstellen",
      icon: Calendar,
      action: () => navigate("/calendar"),
      color: "text-green-600"
    },
    {
      title: "Nachricht senden",
      description: "Nachricht an einen Kontakt senden",
      icon: MessageSquare,
      action: () => navigate("/messages"),
      color: "text-purple-600"
    },
    {
      title: "Team beitreten",
      description: "Einem bestehenden Team beitreten",
      icon: Users,
      action: () => navigate("/teams"),
      color: "text-orange-600"
    }
  ];

  const handleShortcutCreated = () => {
    // Refresh shortcuts if needed
    console.log("Shortcut created");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
          <CardDescription>
            Häufig verwendete Aktionen für einen schnellen Zugriff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={action.action}
                >
                  <Icon className={`h-6 w-6 ${action.color}`} />
                  <div className="text-center">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcutDialog(true)}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Shortcut hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      <ShortcutDialog
        open={showShortcutDialog}
        onOpenChange={setShowShortcutDialog}
        onShortcutCreated={handleShortcutCreated}
      />
    </>
  );
}
