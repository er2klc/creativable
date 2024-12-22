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
  products_services: z.string().min(1, "Produkte/Services sind erforderlich"),
});

interface ProductsServicesFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function ProductsServicesField({ initialValue, onSave }: ProductsServicesFieldProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products_services: initialValue || "",
    },
  });

  React.useEffect(() => {
    if (initialValue) {
      form.reset({ products_services: initialValue });
    }
  }, [initialValue, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="products_services"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produkte/Services 🛍️</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="z.B. Nahrungsergänzungsmittel, Hautpflege" {...field} />
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