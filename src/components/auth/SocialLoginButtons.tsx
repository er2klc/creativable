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
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
          />
        </svg>
        Mit Google fortfahren
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
        onClick={onAppleLogin}
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M17.05 20.28c-.98.95-2.05.88-3.08.38c-1.07-.52-2.04-.53-3.17 0c-1.44.66-2.2.47-3.06-.38C3.34 16.09 3.84 8.78 8.54 8.45c1.51-.11 2.45.83 3.34.83c.87 0 2.53-1.06 3.91-.84c1.49.24 2.47.95 3.17 2.21c-2.92 1.82-2.39 5.95.09 7.39c-.68 1.33-1.57 2.61-2 2.24M13 6.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11"
          />
        </svg>
        Mit Apple fortfahren
      </Button>
    </div>
  );
};