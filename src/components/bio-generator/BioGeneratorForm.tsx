import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  role: z.string().min(1, "Rolle ist erforderlich"),
  target_audience: z.string().min(1, "Zielgruppe ist erforderlich"),
  unique_strengths: z.string().min(1, "Stärken sind erforderlich"),
  mission: z.string().min(1, "Mission ist erforderlich"),
  social_proof: z.string().min(1, "Soziale Beweise sind erforderlich"),
  cta_goal: z.string().min(1, "Call-to-Action ist erforderlich"),
  url: z.string().url("Bitte geben Sie eine gültige URL ein"),
  preferred_emojis: z.string().optional(),
  language: z.enum(["Deutsch", "English"]),
});

interface BioGeneratorFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isGenerating: boolean;
}

export const BioGeneratorForm = ({ onSubmit, isGenerating }: BioGeneratorFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "",
      target_audience: "",
      unique_strengths: "",
      mission: "",
      social_proof: "",
      cta_goal: "",
      url: "",
      preferred_emojis: "",
      language: "Deutsch",
    },
  });

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beruf oder Rolle</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Business Coach, Designer, Fotograf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zielgruppe</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Unternehmer, Frauen, Sportler" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unique_strengths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Einzigartige Stärken</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. NLP-Coach, holistische Wellness" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mission"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mission oder Ziel</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="z.B. Menschen helfen, ihre Traumkarriere zu finden" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_proof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soziale Beweise / Erfolge</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Zertifizierter Coach, 100+ Kunden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cta_goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call-to-Action</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Website besuchen, Kontakt aufnehmen" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link zur Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://ihre-website.de" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferred_emojis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bevorzugte Emojis (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 🚀, 🌟, ❤️" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sprache</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Sprache" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Deutsch">Deutsch</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiere Bio...
              </>
            ) : (
              "Bio generieren"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
};