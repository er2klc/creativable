import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  company_name: z.string().min(1, "Firmenname ist erforderlich"),
});

interface CompanyNameFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function CompanyNameField({ initialValue, onSave }: CompanyNameFieldProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: initialValue || "",
    },
  });

  React.useEffect(() => {
    if (initialValue) {
      form.reset({ company_name: initialValue });
    }
  }, [initialValue, form]);

  const fetchCompanyInfo = async (companyName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-company-info', {
        body: { companyName }
      });

      if (error) throw error;

      if (data) {
        await onSave(data.companyName);
        
        // Update other MLM settings
        const { error: updateError } = await supabase
          .from('settings')
          .update({
            products_services: data.productsServices,
            target_audience: data.targetAudience,
            usp: data.usp,
            business_description: data.businessDescription,
          })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (updateError) throw updateError;

        toast.success("Firmeninformationen erfolgreich aktualisiert");
      }
    } catch (error: any) {
      console.error('Error fetching company info:', error);
      toast.error(error.message || "Fehler beim Abrufen der Firmeninformationen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firmenname 🏢</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="z.B. Zinzino" {...field} />
                </FormControl>
                <Button 
                  type="button"
                  onClick={() => onSave(field.value)}
                >
                  Speichern
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={() => fetchCompanyInfo(field.value)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Laden...
                    </>
                  ) : (
                    "Mit AI analysieren"
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}