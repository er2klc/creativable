import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, Sparkles } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";

interface BusinessFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function BusinessFields({ form }: BusinessFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Firmenname <Building2 className="h-4 w-4 inline" /></FormLabel>
            <FormControl>
              <Input placeholder="Name der MLM-Firma" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="productsServices"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Produkte/Dienstleistungen 🛍️</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Beschreibung der Produkte/Dienstleistungen"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zielgruppe <Users className="h-4 w-4 inline" /></FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Beschreibung der typischen Kunden"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="usp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alleinstellungsmerkmal (USP) <Sparkles className="h-4 w-4 inline" /></FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Was macht Ihr Angebot einzigartig?"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business-Beschreibung 📋</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Detaillierte Beschreibung des MLM-Business"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}