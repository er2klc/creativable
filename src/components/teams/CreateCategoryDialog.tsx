import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface CreateCategoryDialogProps {
  teamId: string;
}

export function CreateCategoryDialog({ teamId }: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { error } = await supabase
        .from("team_categories")
        .insert({
          team_id: teamId,
          name,
          description,
          created_by: user.id,
          slug
        });

      if (error) throw error;

      toast.success("Kategorie erfolgreich erstellt");
      setIsOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["team-categories", teamId] });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast.error(error.message || "Fehler beim Erstellen der Kategorie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Kategorie erstellen
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Neue Kategorie</SheetTitle>
          <SheetDescription>
            Erstellen Sie eine neue Kategorie für Ihr Team
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Kategorie Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Wird erstellt..." : "Erstellen"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
