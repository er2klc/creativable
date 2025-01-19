import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "./use-settings";
import { useAuth } from "./use-auth";

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
  const { user } = useAuth();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["contact-field-settings"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("contact_field_settings")
        .select("*")
        .eq('user_id', user.id)
        .order("order_index");

      if (error) throw error;
      return data as ContactFieldSetting[];
    },
    enabled: !!user?.id,
  });

  const addField = async (params: AddFieldParams) => {
    if (!user?.id) {
      toast.error(settings?.language === "en" ? "Not authenticated" : "Nicht authentifiziert");
      return;
    }

    const { data, error } = await supabase
      .from("contact_field_settings")
      .insert({
        ...params,
        user_id: user.id,
        order_index: fields.length,
      })
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
    return data;
  };

  const updateFieldOrder = useMutation({
    mutationFn: async (updatedFields: ContactFieldSetting[]) => {
      if (!user?.id) {
        toast.error(settings?.language === "en" ? "Not authenticated" : "Nicht authentifiziert");
        return;
      }

      // Create updates array with all required fields
      const updates = updatedFields.map((field, index) => ({
        id: field.id,
        user_id: field.user_id,
        field_name: field.field_name,
        field_type: field.field_type,
        field_group: field.field_group,
        order_index: index,
        icon: field.icon
      }));

      const { error } = await supabase
        .from("contact_field_settings")
        .upsert(updates);

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