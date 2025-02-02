import { useSettings } from "@/hooks/use-settings";

export const LeadDetailLoading = () => {
  const { settings } = useSettings();
  
  return (
    <div className="p-6">
      {settings?.language === "en" ? "Loading..." : "Lädt..."}
    </div>
  );
};