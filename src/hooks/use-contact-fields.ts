import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "./use-settings";

export interface ContactFieldSetting {
  id: string;
  user_id: string;
  field_name: string;
  field_type: string;
  field_group: string;
  icon?: string | null;
  order_index: number;
  created_at?: string;
}

export const useContactFields = () => {
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["contact-field-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_field_settings")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data as ContactFieldSetting[];
    },
  });

  const updateFieldOrder = useMutation({
    mutationFn: async (updates: ContactFieldSetting[]) => {
      const { error } = await supabase
        .from("contact_field_settings")
        .upsert(
          updates.map((field, index) => ({
            ...field,
            order_index: index,
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-field-settings"] });
      toast.success(
        settings?.language === "en"
          ? "Field order updated successfully"
          : "Feldreihenfolge erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating field order:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating field order"
          : "Fehler beim Aktualisieren der Feldreihenfolge"
      );
    },
  });

  const updateField = useMutation({
    mutationFn: async (field: Partial<ContactFieldSetting> & { id: string }) => {
      const { error } = await supabase
        .from("contact_field_settings")
        .update(field)
        .eq("id", field.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-field-settings"] });
      toast.success(
        settings?.language === "en"
          ? "Field updated successfully"
          : "Feld erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating field:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating field"
          : "Fehler beim Aktualisieren des Feldes"
      );
    },
  });

  return {
    fields,
    isLoading,
    updateFieldOrder,
    updateField,
  };
};