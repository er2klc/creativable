
import { SearchBar } from "./SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { UserCircle } from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";

export const DashboardHeader = () => {
  const user = useUser();

  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                Dashboard
              </h1>
            </div>
            
            <div className="hidden md:block w-[300px]">
              <SearchBar />
            </div>
            
            <HeaderActions userEmail={user?.email} />
          </div>
        </div>
      </div>
    </div>
  );
};
