
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { LeadPhases } from "@/components/dashboard/LeadPhases";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useNavigate } from "react-router-dom";
import { autoProcessEmbeddings } from "@/lib/auto-embeddings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Something went wrong:</h2>
      <pre className="text-sm overflow-auto">{error.message}</pre>
      <Button 
        className="mt-4" 
        onClick={resetErrorBoundary}
        variant="outline"
      >
        Try again
      </Button>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleManualProcessing = async () => {
    try {
      setIsProcessing(true);
      const result = await autoProcessEmbeddings(false);
      if (result) {
        toast.success("Daten wurden für den KI-Zugriff verarbeitet");
      } else {
        toast.info("Keine Verarbeitung erforderlich");
      }
    } catch (error) {
      console.error("Fehler bei der Datenverarbeitung:", error);
      toast.error("Fehler bei der Datenverarbeitung");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="fixed top-0 left-0 right-0 z-[40] flex items-center justify-between bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/90 px-4 py-2 border-b border-sidebar-border md:hidden h-16">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <div 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img 
              src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
              alt="Logo" 
              className="h-8 w-8"
            />
            <span className="text-sm text-white font-light">creativable</span>
          </div>
        </div>
      </div>
      <DashboardHeader userEmail={user?.email} />
      <div className="pt-[132px] md:pt-[84px] space-y-8 px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualProcessing}
            disabled={isProcessing}
            className="text-xs"
          >
            {isProcessing ? "Verarbeite..." : "KI-Daten aktualisieren"}
          </Button>
        </div>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <QuickActions />
        </ErrorBoundary>
        
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <DashboardMetrics />
        </ErrorBoundary>
        
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <LeadPhases />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Dashboard;
