import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Clipboard, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

const BioGenerator = () => {
  const { toast } = useToast();
  const { settings } = useSettings();
  const [generatedBio, setGeneratedBio] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateBio = async (values: z.infer<typeof formSchema>) => {
    if (!settings?.openai_api_key) {
      toast({
        title: "API-Key fehlt",
        description: "Bitte hinterlegen Sie Ihren OpenAI API-Key in den Einstellungen.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bio", {
        body: JSON.stringify(values),
      });

      if (error) throw error;
      setGeneratedBio(data.bio);
      toast({
        title: "Bio generiert",
        description: "Ihre Instagram-Bio wurde erfolgreich erstellt.",
      });
    } catch (error) {
      console.error("Error generating bio:", error);
      toast({
        title: "Fehler",
        description: "Bio konnte nicht generiert werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBio);
    toast({
      title: "Kopiert!",
      description: "Bio wurde in die Zwischenablage kopiert.",
    });
  };

  if (!settings?.openai_api_key) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI API-Schlüssel fehlt</AlertTitle>
          <AlertDescription>
            Um den Bio Generator nutzen zu können, benötigst du einen OpenAI API-Schlüssel. 
            Du kannst deinen API-Schlüssel in den{" "}
            <Link to="/settings" className="font-medium underline underline-offset-4">
              Einstellungen
            </Link>{" "}
            hinterlegen.
            <div className="mt-2">
              <p>So findest du deinen API-Schlüssel:</p>
              <ol className="list-decimal list-inside mt-2">
                <li>Gehe zu <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI API Keys</a></li>
                <li>Melde dich an oder erstelle ein Konto</li>
                <li>Klicke auf "Create new secret key"</li>
                <li>Kopiere den generierten Schlüssel (beginnt mit "sk-")</li>
                <li>Füge den Schlüssel in den Einstellungen ein</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Instagram Bio Generator</h1>
        <p className="text-muted-foreground mt-2">
          Erstellen Sie eine professionelle Instagram-Bio mit KI-Unterstützung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generateBio)} className="space-y-4">
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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generierte Bio</h2>
          <div className="min-h-[200px] p-4 bg-muted rounded-lg relative">
            {generatedBio ? (
              <>
                <p className="whitespace-pre-wrap">{generatedBio}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                Ihre generierte Bio wird hier angezeigt...
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BioGenerator;