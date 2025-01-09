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
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2"
        onClick={onGoogleLogin}
        disabled={isLoading}
      >
        <img 
          src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_32dp.png" 
          alt="Google" 
          className="h-4 w-auto object-contain"
        />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2"
        onClick={onAppleLogin}
        disabled={isLoading}
      >
        <img 
          src="https://www.apple.com/ac/globalnav/7/en_US/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg" 
          alt="Apple" 
          className="h-4 w-auto object-contain"
        />
        Apple
      </Button>
    </div>
  );
};