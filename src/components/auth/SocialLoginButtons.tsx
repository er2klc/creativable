import { Button } from "@/components/ui/button";

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
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
        onClick={onAppleLogin}
        disabled={isLoading}
      >
        Apple
      </Button>
    </div>
  );
};