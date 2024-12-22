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
  usp: z.string().min(1, "USP ist erforderlich"),
});

interface UspFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function UspField({ initialValue, onSave }: UspFieldProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usp: initialValue || "",
    },
  });

  React.useEffect(() => {
    if (initialValue) {
      form.reset({ usp: initialValue });
    }
  }, [initialValue, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="usp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alleinstellungsmerkmal (USP) ⭐</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="z.B. Patentierte Formel, Wissenschaftlich belegt" {...field} />
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