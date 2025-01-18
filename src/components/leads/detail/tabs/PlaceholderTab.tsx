import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";

interface PlaceholderTabProps {
  title: string;
}

export const PlaceholderTab = ({ title }: PlaceholderTabProps) => {
  const { settings } = useSettings();
  
  return (
    <div className="space-y-4">
      <div>
        <Label>
          {settings?.language === "en" ? `Add ${title}` : `${title} hinzufügen`}
        </Label>
        <div className="mt-2">
          {/* Placeholder for future implementation */}
        </div>
      </div>
    </div>
  );
};