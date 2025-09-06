import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginFormData } from "@/hooks/auth/use-login";

interface LoginFormProps {
  formData: LoginFormData;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm = ({ formData, isLoading, onInputChange }: LoginFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={onInputChange}
          disabled={isLoading}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onInputChange}
          disabled={isLoading}
          required
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>
    </>
  );
};