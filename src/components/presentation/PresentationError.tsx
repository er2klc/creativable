import { Card } from "@/components/ui/card";

interface PresentationErrorProps {
  error: string;
}

export const PresentationError = ({ error }: PresentationErrorProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0A0A]">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      <Card className="relative bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm p-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold mb-4">
            {error}
          </h1>
        </div>
      </Card>
    </div>
  );
};