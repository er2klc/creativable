import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={cn("flex-1 w-full px-8 py-8", className)}>
      <div className="w-full max-w-full">
        {children}
      </div>
    </main>
  );
};