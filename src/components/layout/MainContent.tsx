interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  );
};