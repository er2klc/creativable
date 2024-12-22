import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  instagram_app_id: z.string().min(1, "Instagram App ID ist erforderlich"),
  instagram_app_secret: z.string().min(1, "Instagram App Secret ist erforderlich"),
});

interface InstagramConnectionFormProps {
  defaultValues: {
    instagram_app_id: string;
    instagram_app_secret: string;
  };
  onConnect: (appId: string, appSecret: string) => void;
}

export function InstagramConnectionForm({ defaultValues, onConnect }: InstagramConnectionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onConnect(values.instagram_app_id, values.instagram_app_secret);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="instagram_app_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram App ID</FormLabel>
              <FormControl>
                <Input 
                  placeholder="123456789..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagram_app_secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram App Secret</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="abc123..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit"
          className="w-full"
        >
          Mit Instagram verbinden
        </Button>
      </form>
    </Form>
  );
}