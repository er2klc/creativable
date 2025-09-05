import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Phone, Mail, Calendar, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActionButtons() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Neuer Lead",
      icon: Plus,
      color: "from-blue-500 to-blue-600",
      onClick: () => navigate("/contacts/add")
    },
    {
      label: "Anruf planen", 
      icon: Phone,
      color: "from-green-500 to-green-600",
      onClick: () => navigate("/calendar")
    },
    {
      label: "E-Mail senden",
      icon: Mail,
      color: "from-purple-500 to-purple-600", 
      onClick: () => navigate("/messages")
    },
    {
      label: "Meeting",
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
      onClick: () => navigate("/calendar")
    },
    {
      label: "Team",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      onClick: () => navigate("/teams")
    },
    {
      label: "Ziele",
      icon: Target,
      color: "from-pink-500 to-pink-600", 
      onClick: () => navigate("/goals")
    }
  ];

  return (
    <Card className="shadow-sm border-0">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="group h-10 px-3 border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:scale-105"
            >
              <div className={`bg-gradient-to-r ${action.color} rounded-md p-1.5 mr-2 group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}