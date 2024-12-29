import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="container max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          {/* Hero Section */}
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Willkommen bei <span className="text-primary">Lovable</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl">
              Ihre Plattform für effizientes Lead Management und Kommunikation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session ? (
                <>
                  <Button
                    size="lg"
                    className="font-semibold"
                    onClick={() => navigate("/auth")}
                  >
                    Jetzt Anmelden
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-semibold"
                    onClick={() => navigate("/auth/register")}
                  >
                    Registrieren
                  </Button>
                </>
              ) : (
                <Button
                  size="lg"
                  className="font-semibold"
                  onClick={() => navigate("/dashboard")}
                >
                  Zum Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <div className="flex flex-col items-center p-6 space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Lead Management</h3>
              <p className="text-muted-foreground text-center">
                Verwalten Sie Ihre Leads effizient und behalten Sie den Überblick
              </p>
            </div>

            <div className="flex flex-col items-center p-6 space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Automatisierung</h3>
              <p className="text-muted-foreground text-center">
                Automatisieren Sie Ihre Kommunikation und sparen Sie wertvolle Zeit
              </p>
            </div>

            <div className="flex flex-col items-center p-6 space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-3 rounded-full bg-primary/10">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Analyse & Insights</h3>
              <p className="text-muted-foreground text-center">
                Gewinnen Sie wertvolle Einblicke in Ihre Lead-Aktivitäten
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;