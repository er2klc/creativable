import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={cn("flex-1 p-8 ml-[60px]", className)}>
      <div className="mx-auto">
        {children}
      </div>
    </main>
  );
};