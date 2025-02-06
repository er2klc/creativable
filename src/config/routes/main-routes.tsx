import { Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Plan from "@/pages/Plan";
import Billing from "@/pages/Billing";

export const mainRoutes = [
  <Route path="/dashboard" element={<Dashboard />} />,
  <Route path="/settings" element={<Settings />} />,
  <Route path="/plan" element={<Plan />} />,
  <Route path="/billing" element={<Billing />} />,
];
