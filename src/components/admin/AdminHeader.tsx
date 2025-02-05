import { LayoutDashboard } from "lucide-react";

export const AdminHeader = () => {
  return (
    <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
      <LayoutDashboard className="h-8 w-8" />
      Admin Dashboard
    </h1>
  );
};