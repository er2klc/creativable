import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      <Card className="relative w-full max-w-[400px] bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-6">
          <div className="flex justify-center">
            <img src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" alt="Creativable Logo" className="h-16 w-16" />
          </div>
          <div>
            <CardTitle className="text-white text-center">{title}</CardTitle>
            <CardDescription className="text-gray-300">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-white">{children}</CardContent>
      </Card>
    </div>
  );
};