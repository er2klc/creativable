import { Navigation } from "./Navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 p-4 md:p-8">{children}</main>
    </div>
  );
};