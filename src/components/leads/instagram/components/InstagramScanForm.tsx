import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(1, "Username ist erforderlich"),
});

interface InstagramScanFormProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
}

export function InstagramScanForm({ onSubmit, isLoading }: InstagramScanFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      onSubmit(values.username);
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("Ein Fehler ist aufgetreten");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <Label>Instagram Username</Label>
              <FormControl>
                <Input placeholder="z.B. elonmusk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Scanning..." : "Scan starten"}
        </Button>
      </form>
    </Form>
  );
}