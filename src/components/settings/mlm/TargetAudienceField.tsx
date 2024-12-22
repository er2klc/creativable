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
  target_audience: z.string().min(1, "Zielgruppe ist erforderlich"),
});

interface TargetAudienceFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function TargetAudienceField({ initialValue, onSave }: TargetAudienceFieldProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      target_audience: initialValue || "",
    },
  });

  React.useEffect(() => {
    if (initialValue) {
      form.reset({ target_audience: initialValue });
    }
  }, [initialValue, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="target_audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zielgruppe 👥</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="z.B. Gesundheitsbewusste Menschen, Sportler" {...field} />
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