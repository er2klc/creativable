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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

const formSchema = z.object({
  business_description: z.string().min(1, "Geschäftsbeschreibung ist erforderlich"),
});

interface BusinessDescriptionFieldProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
}

export function BusinessDescriptionField({ initialValue, onSave }: BusinessDescriptionFieldProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_description: initialValue || "",
    },
  });

  React.useEffect(() => {
    if (initialValue) {
      form.reset({ business_description: initialValue });
    }
  }, [initialValue, form]);

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="business_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Geschäftsbeschreibung 📝</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea 
                    placeholder="Beschreiben Sie Ihr Geschäft und was Sie anbieten..."
                    className="resize-none"
                    {...field}
                  />
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