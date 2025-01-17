import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Globe, AtSign, Mail, Phone } from "lucide-react";
import { platformsConfig } from "@/config/platforms";

interface BasicLeadFieldsProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
}

export const BasicLeadFields = ({
  register,
  errors,
  watch,
  setValue,
}: BasicLeadFieldsProps) => {
  const session = useSession();
  
  // First get the default pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index")
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!pipeline?.id,
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Name
          </div>
        </Label>
        <Input
          {...register("name", { required: true })}
          placeholder="Name des Kontakts"
        />
        {errors.name && (
          <span className="text-sm text-red-500">Name ist erforderlich</span>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Plattform
          </div>
        </Label>
        <Select
          value={watch("platform")}
          onValueChange={(value) => setValue("platform", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plattform auswählen" />
          </SelectTrigger>
          <SelectContent>
            {platformsConfig.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <AtSign className="h-4 w-4" />
            Benutzername
          </div>
        </Label>
        <Input
          {...register("social_media_username")}
          placeholder="Benutzername auf der Plattform"
        />
      </div>

      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Phase
          </div>
        </Label>
        <Select
          value={watch("phase")}
          onValueChange={(value) => setValue("phase", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Phase auswählen" />
          </SelectTrigger>
          <SelectContent>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.name}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail
          </div>
        </Label>
        <Input
          type="email"
          {...register("email")}
          placeholder="E-Mail-Adresse"
        />
        {errors.email && (
          <span className="text-sm text-red-500">
            Gültige E-Mail-Adresse erforderlich
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefon
          </div>
        </Label>
        <Input
          type="tel"
          {...register("phone_number")}
          placeholder="Telefonnummer"
        />
      </div>
    </div>
  );
};