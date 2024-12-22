import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok", "Andere"] as const;
const phases = ["initial_contact", "follow_up", "closing"] as const;
const industries = [
  "Gesundheit",
  "Marketing",
  "Technologie",
  "Bildung",
  "Finanzen",
  "Andere",
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  platform: z.enum([...platforms]),
  customPlatform: z.string().optional(),
  phase: z.enum([...phases]),
  industry: z.string().min(1, "Branche ist erforderlich"),
  lastAction: z.string().optional(),
  notes: z.string().optional(),
});

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [otherPlatform, setOtherPlatform] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      platform: "LinkedIn",
      customPlatform: "",
      phase: "initial_contact",
      industry: "",
      lastAction: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast({
        title: "Fehler",
        description: "Sie müssen eingeloggt sein, um einen Lead hinzuzufügen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("leads").insert({
        user_id: session.user.id,
        name: values.name,
        platform: otherPlatform ? values.customPlatform : values.platform,
        phase: values.phase,
        industry: values.industry,
        last_action: values.lastAction || null,
        notes: values.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Lead erfolgreich hinzugefügt",
      });

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Hinzufügen des Leads ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Lead hinzufügen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plattform</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setOtherPlatform(value === "Andere");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Plattform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otherPlatform && (
              <FormField
                control={form.control}
                name="customPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Andere Plattform</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Twitter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Phase" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="initial_contact">Erstkontakt</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="closing">Abschluss</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branche</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Branche" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letzte Aktion</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Nachricht gesendet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Zusätzliche Informationen zum Lead..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}