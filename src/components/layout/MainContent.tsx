import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={cn("flex-1 p-8 w-full", className)}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};