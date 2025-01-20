import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Users, UserCheck, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PoolCategorySelectorProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function PoolCategorySelector({ lead, onUpdateLead }: PoolCategorySelectorProps) {
  const { settings } = useSettings();

  const handleCategorySelect = async (category: string) => {
    try {
      const updates: Partial<Tables<"leads">> = {
        pool_category: category,
      };

      // Initialize onboarding progress when moving to partner category
      if (category === 'partner') {
        updates.onboarding_progress = {
          message_sent: false,
          team_invited: false,
          training_provided: false,
          intro_meeting_scheduled: false
        };
      }

      await onUpdateLead(updates);
      toast.success(
        settings?.language === "en"
          ? "Category updated successfully"
          : "Kategorie erfolgreich aktualisiert"
      );
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating category"
          : "Fehler beim Aktualisieren der Kategorie"
      );
    }
  };

  const categories = [
    {
      id: 'partner',
      label: settings?.language === "en" ? "Partner" : "Partner",
      icon: <UserCheck className="h-4 w-4" />,
      variant: lead.pool_category === 'partner' ? 'default' : 'outline' as const
    },
    {
      id: 'kunde',
      label: settings?.language === "en" ? "Customer" : "Kunde",
      icon: <Users className="h-4 w-4" />,
      variant: lead.pool_category === 'kunde' ? 'default' : 'outline' as const
    },
    {
      id: 'not_for_now',
      label: settings?.language === "en" ? "Not For Now" : "NotForNow",
      icon: <Clock className="h-4 w-4" />,
      variant: lead.pool_category === 'not_for_now' ? 'default' : 'outline' as const
    },
    {
      id: 'kein_interesse',
      label: settings?.language === "en" ? "Not Interested" : "Kein Interesse",
      icon: <XCircle className="h-4 w-4" />,
      variant: lead.pool_category === 'kein_interesse' ? 'default' : 'outline' as const
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={category.variant}
          size="sm"
          onClick={() => handleCategorySelect(category.id)}
          className="flex items-center gap-2"
        >
          {category.icon}
          {category.label}
        </Button>
      ))}
    </div>
  );
}