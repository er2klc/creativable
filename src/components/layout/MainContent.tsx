import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent = ({ children, className }: MainContentProps) => {
  return (
    <main className={cn("flex-1 px-16 py-8", className)}>
      <div className="mx-auto max-w-[1920px]">
        {children}
      </div>
    </main>
  );
};