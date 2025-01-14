import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddImageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  theme: string;
  onThemeChange: (value: string) => void;
  onAddImage: () => Promise<void>;
}

export const AddImageDialog = ({
  isOpen,
  onOpenChange,
  isLoading,
  theme,
  onThemeChange,
  onAddImage,
}: AddImageDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Visionsbild erstellen</DialogTitle>
          <DialogDescription>
            Geben Sie ein Thema ein, und wir generieren ein passendes Bild für Ihr Vision Board.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Thema</Label>
            <Input
              id="theme"
              placeholder="z.B. Ein traumhaftes Strandhaus bei Sonnenuntergang"
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
            />
          </div>
          <Button
            onClick={onAddImage}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              "Bild generieren"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};