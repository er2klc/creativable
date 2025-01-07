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
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
          <CardDescription className="text-gray-300">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-white">{children}</CardContent>
      </Card>
    </div>
  );
};