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

const formSchema = z.object({
  company_name: z.string().min(1, "Firmenname ist erforderlich"),
});

interface CompanyNameFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function CompanyNameField({ initialValue, onSave }: CompanyNameFieldProps) {
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
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}