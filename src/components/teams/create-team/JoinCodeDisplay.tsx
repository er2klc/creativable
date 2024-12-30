import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface JoinCodeDisplayProps {
  joinCode: string;
}

export const JoinCodeDisplay = ({ joinCode }: JoinCodeDisplayProps) => {
  const copyJoinCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    toast.success("Beitritts-Code kopiert!");
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Team Beitritts-Code:</p>
        <div className="flex items-center gap-2">
          <code className="bg-background p-2 rounded flex-1">{joinCode}</code>
          <Button size="icon" variant="outline" onClick={copyJoinCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Teilen Sie diesen Code mit Ihren Teammitgliedern, damit sie beitreten können.
        </p>
      </div>
    </div>
  );
};