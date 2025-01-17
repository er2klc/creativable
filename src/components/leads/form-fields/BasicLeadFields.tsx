import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "../AddLeadFormFields";
import { User, Globe, AtSign, Mail, Phone } from "lucide-react";
import { platformsConfig, type Platform } from "@/config/platforms";

interface BasicLeadFieldsProps {
  form: UseFormReturn<FormData>;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  const { register, watch, setValue } = form;
  const selectedPlatform = watch("platform");

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Name
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Name des Kontakts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Plattform
        </Label>
        <Select
          onValueChange={(value) => setValue("platform", value as Platform)}
          value={selectedPlatform}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plattform auswählen" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(platformsConfig).map((platform) => (
              <SelectItem key={platform.name} value={platform.name}>
                {platform.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="social_media_username" className="flex items-center gap-2">
          <AtSign className="h-4 w-4" />
          Benutzername
        </Label>
        <Input
          id="social_media_username"
          {...register("social_media_username")}
          placeholder="@username"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Branche
        </Label>
        <Input
          id="industry"
          {...register("industry")}
          placeholder="z.B. E-Commerce, Marketing, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          E-Mail
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Telefon
        </Label>
        <Input
          id="phone_number"
          type="tel"
          {...register("phone_number")}
          placeholder="+49 123 456789"
        />
      </div>
    </>
  );
}