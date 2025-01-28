import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

interface InstagramScanFormProps {
  username: string;
  setUsername: (username: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function InstagramScanForm({
  username,
  setUsername,
  isLoading,
  isSuccess,
  onSubmit,
  onCancel
}: InstagramScanFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Instagram Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          placeholder="Enter Instagram username"
          disabled={isLoading}
        />
      </div>
      
      {isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="mt-2 text-green-700">
            Contact successfully created!
          </AlertDescription>
        </Alert>
      )}

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