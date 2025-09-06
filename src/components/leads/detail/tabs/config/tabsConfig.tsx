
import { 
  CalendarIcon, Video, Youtube, FileText, Phone, 
  MessageSquare, Pencil, ListTodo, Upload, Mail 
} from "lucide-react";
import React from "react";

// Definiere Farbschema für Tabs
export const tabColors = {
  notes: "#FEF08A",         // Soft yellow
  tasks: "#A5F3FC",         // Soft cyan
  appointments: "#FDBA74",  // Soft orange
  messages: "#BFDBFE",      // Soft blue
  uploads: "#E5E7EB",       // Soft gray
  zoom: "#2D8CFF",          // Zoom blue
  youtube: "#FF0000",       // YouTube red
  documents: "#34D399",     // Soft green
  callscript: "#FF7F50",    // Soft coral
  messagegenerator: "#8A2BE2" // Purple
};

export interface TabItem {
  id: string;
  label: string;      // Singular form
  icon: React.ReactNode;
  color: string;
  showDialog?: boolean;
  iconOnly?: boolean;
}

export const getTabItems = (isEnglish: boolean): TabItem[] => {
  return [
    {
      id: "notes",
      label: isEnglish ? "Note" : "Notiz",
      icon: <Pencil className="h-4 w-4" />,
      color: tabColors.notes
    },
    {
      id: "tasks",
      label: isEnglish ? "Task" : "Aufgabe",
      icon: <ListTodo className="h-4 w-4" />,
      color: tabColors.tasks
    },
    {
      id: "appointments",
      label: isEnglish ? "Appointment" : "Termin",
      icon: <CalendarIcon className="h-4 w-4" />,
      color: tabColors.appointments,
      showDialog: true
    },
    {
      id: "messages",
      label: isEnglish ? "Email" : "E-Mail",
      icon: <Mail className="h-4 w-4" />,
      color: tabColors.messages
    },
    {
      id: "uploads",
      label: isEnglish ? "Upload" : "Datei",
      icon: <Upload className="h-4 w-4" />,
      color: tabColors.uploads
    },
    {
      id: "callscript",
      label: isEnglish ? "Call Script" : "Telefonscript",
      icon: <Phone className="h-4 w-4" />,
      color: tabColors.callscript
    },
    {
      id: "messagegenerator",
      label: isEnglish ? "Message" : "Nachricht",
      icon: <MessageSquare className="h-4 w-4" />,
      color: tabColors.messagegenerator
    },
    {
      id: "zoom",
      label: "Zoom",
      icon: <Video className="h-4 w-4" />,
      color: tabColors.zoom,
      showDialog: true,
      iconOnly: true
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: <Youtube className="h-4 w-4" />,
      color: tabColors.youtube,
      showDialog: true,
      iconOnly: true
    },
    {
      id: "documents",
      label: isEnglish ? "Document" : "Dokument",
      icon: <FileText className="h-4 w-4" />,
      color: tabColors.documents,
      showDialog: true,
      iconOnly: true
    }
  ];
};
