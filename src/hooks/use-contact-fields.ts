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

interface AddFieldParams {
  field_name: string;
  field_group: string;
  field_type: string;
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

  const addField = async (params: AddFieldParams) => {
    const { data, error } = await supabase
      .from("contact_field_settings")
      .insert([
        {
          ...params,
          order_index: fields.length,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding field:", error);
      toast.error(
        settings?.language === "en"
          ? "Error adding field"
          : "Fehler beim Hinzufügen des Feldes"
      );
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ["contact-field-settings"] });
    toast.success(
      settings?.language === "en"
        ? "Field added successfully"
        : "Feld erfolgreich hinzugefügt"
    );

    return data;
  };

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

  return {
    fields,
    isLoading,
    updateFieldOrder,
    addField,
  };
};