import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useSettings } from "@/hooks/use-settings";

interface MetadataDisplayProps {
  last_edited_at?: string;
  created_at?: string;
}

export const MetadataDisplay = ({ last_edited_at, created_at }: MetadataDisplayProps) => {
  const { settings } = useSettings();
  
  if (!last_edited_at) return null;
  
  return (
    <div className="text-xs text-gray-500 mt-2">
      {settings?.language === "en" ? "Created" : "Erstellt"}: {format(new Date(created_at || ''), 'PPp', { locale: settings?.language === "en" ? undefined : de })}
      <br />
      {settings?.language === "en" ? "Last edited" : "Zuletzt bearbeitet"}: {format(new Date(last_edited_at), 'PPp', { locale: settings?.language === "en" ? undefined : de })}
    </div>
  );
};