import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkedInScanFormProps {
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function LinkedInScanForm({
  username,
  setUsername,
  isLoading,
  isSuccess,
  onSubmit,
  onCancel
}: LinkedInScanFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">LinkedIn Username</Label>
        <Input
          id="username"
          placeholder="username (without URL)"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}