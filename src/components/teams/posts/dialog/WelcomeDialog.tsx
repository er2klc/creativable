
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  introduction: z.string().min(10, "Bitte stell dich kurz vor (mindestens 10 Zeichen)")
});

interface WelcomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  categoryId: string;
}

export function WelcomeDialog({ isOpen, onClose, onSubmit, categoryId }: WelcomeDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      introduction: ""
    }
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Herzlich Willkommen! 👋</DialogTitle>
          <DialogDescription>
            Schön, dass du da bist! Bitte stell dich kurz der Community vor.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dein Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Wie möchtest du genannt werden?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Über dich</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Erzähl uns ein bisschen über dich... Was machst du? Was interessiert dich?" 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Später vorstellen
              </Button>
              <Button type="submit">
                Vorstellung absenden
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
