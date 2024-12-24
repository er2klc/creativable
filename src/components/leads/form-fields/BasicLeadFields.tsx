import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Platform, platformsConfig } from "@/config/platforms";
import * as z from "zod";

interface BasicLeadFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name 👤</FormLabel>
            <FormControl>
              <Input placeholder="Name des Kontakts" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kontaktquelle 🌐</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wo haben Sie den Kontakt kennengelernt?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {platformsConfig.map((platform) => (
                  <SelectItem key={platform.name} value={platform.name}>
                    <div className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4 text-gray-900" />
                      {platform.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="socialMediaUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Social Media Benutzername 📱</FormLabel>
            <FormControl>
              <Input 
                placeholder="Benutzername (ohne @ oder URL)" 
                {...field}
                onChange={(e) => {
                  const username = e.target.value.replace(/^@/, '');
                  field.onChange(username);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phase 📊</FormLabel>
            <FormControl>
              <Input placeholder="Phase des Kontakts" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-Mail 📧</FormLabel>
            <FormControl>
              <Input type="email" placeholder="E-Mail-Adresse" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefonnummer 📞</FormLabel>
            <FormControl>
              <Input placeholder="Telefonnummer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Firmenname 🏢</FormLabel>
            <FormControl>
              <Input placeholder="Name der Firma" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branche 🏭</FormLabel>
            <FormControl>
              <Input placeholder="Branche" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}