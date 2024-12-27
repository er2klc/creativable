import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => Promise<void>;
  onAppleLogin: () => Promise<void>;
  isLoading: boolean;
}

export const SocialLoginButtons = ({ onGoogleLogin, onAppleLogin, isLoading }: SocialLoginButtonsProps) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Oder anmelden mit
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onGoogleLogin}
          disabled={isLoading}
        >
          <FcGoogle className="h-5 w-5 mr-2" />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onAppleLogin}
          disabled={isLoading}
        >
          <FaApple className="h-5 w-5 mr-2" />
          Apple
        </Button>
      </div>
    </div>
  );
};