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
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        <img 
          src="/lovable-uploads/5a7338a2-5048-441b-85cc-019706e45223.png" 
          alt="Google" 
          className="h-4 w-auto object-contain"
        />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gradient-to-r after:from-red-500 after:via-yellow-500 after:to-blue-500"
        onClick={onAppleLogin}
        disabled={isLoading}
      >
        <img 
          src="/lovable-uploads/e39946c9-8413-4b84-a119-1d00818b24d3.png" 
          alt="Apple" 
          className="h-4 w-auto object-contain"
        />
        Apple
      </Button>
    </div>
  );
};