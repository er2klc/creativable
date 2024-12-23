import { useState } from "react";
import { Plus, Calendar, Clock, Video, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    color: string;
    due_date: string | null;
    meeting_type: string | null;
  }) => void;
}

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const { settings } = useSettings();
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FEF7CD");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const dueDate = selectedDate && selectedTime 
        ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
        : null;

      onSubmit({
        title,
        color: selectedColor,
        due_date: dueDate,
        meeting_type: selectedType || null,
      });
      setTitle("");
      setSelectedDate("");
      setSelectedTime("");
      setSelectedType("");
    }
  };

  const MEETING_TYPES = [
    { value: "phone_call", label: settings?.language === "en" ? "Phone Call 📞" : "Telefongespräch 📞", icon: <Phone className="h-4 w-4" /> },
    { value: "on_site", label: settings?.language === "en" ? "On-site Meeting 🏢" : "Vor-Ort-Termin 🏢", icon: <MapPin className="h-4 w-4" /> },
    { value: "zoom", label: settings?.language === "en" ? "Zoom Meeting 💻" : "Zoom Meeting 💻", icon: <Video className="h-4 w-4" /> },
    { value: "initial_meeting", label: settings?.language === "en" ? "Initial Meeting 👋" : "Erstgespräch 👋", icon: <Users className="h-4 w-4" /> },
    { value: "presentation", label: settings?.language === "en" ? "Presentation 📊" : "Präsentation 📊", icon: <BarChart className="h-4 w-4" /> },
    { value: "follow_up", label: settings?.language === "en" ? "Follow-up 🔄" : "Folgetermin 🔄", icon: <RefreshCw className="h-4 w-4" /> }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={settings?.language === "en" ? "New task..." : "Neue Aufgabe..."}
      />
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-32"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={settings?.language === "en" ? "Meeting type" : "Terminart"} />
          </SelectTrigger>
          <SelectContent>
            {MEETING_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  {type.icon}
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer"
        />
        <Button type="submit" className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "+ Add Task" : "+ Aufgabe hinzufügen"}
        </Button>
      </div>
    </form>
  );
};