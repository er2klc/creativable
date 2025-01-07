import { Button } from "@/components/ui/button";
import { Apple, Chrome } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
  isLoading: boolean;
}

export const SocialLoginButtons = ({
  onGoogleLogin,
  onAppleLogin,
  isLoading,
}: SocialLoginButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2"
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        <Chrome className="h-4 w-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2"
        onClick={onAppleLogin}
        disabled={isLoading}
      >
        <Apple className="h-4 w-4" />
        Apple
      </Button>
    </div>
  );
};