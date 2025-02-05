
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/hooks/use-settings";
import { PresentationLinkCard } from "./presentation/PresentationLinkCard";
import { usePresentationPage } from "./presentation/usePresentationPage";

interface PresentationTabProps {
  leadId: string;
  type: "zoom" | "youtube" | "documents";
  tabColors: Record<string, string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PresentationTab({ leadId, type, tabColors, isOpen, onOpenChange }: PresentationTabProps) {
  const { settings } = useSettings();
  const { links, loadLinks, createPresentationPage } = usePresentationPage(leadId, () => onOpenChange(false));

  useEffect(() => {
    if (isOpen) {
      loadLinks(type);
    }
  }, [type, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" ? "Select Link" : "Link auswählen"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {settings?.language === "en" ? 
                  "No links available. Add some links in the Links section." : 
                  "Keine Links verfügbar. Fügen Sie Links im Bereich Links hinzu."}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {links.map((link) => (
                  <PresentationLinkCard
                    key={link.id}
                    link={link}
                    type={type}
                    tabColors={tabColors}
                    onAddClick={createPresentationPage}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
