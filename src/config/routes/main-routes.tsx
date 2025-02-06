import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Plan from "@/pages/Plan";
import Billing from "@/pages/Billing";
import Contacts from "@/pages/Contacts";
import Pool from "@/pages/Pool";
import Calendar from "@/pages/Calendar";
import Todo from "@/pages/Todo";
import Messages from "@/pages/Messages";
import Links from "@/pages/Links";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import Admin from "@/pages/Admin";

export const mainRoutes = (
  <>
    <Route path="/" element={<ProtectedRoute />}>
      <Route index element={<Dashboard />} />
      <Route path="settings" element={<Settings />} />
      <Route path="plan" element={<Plan />} />
      <Route path="billing" element={<Billing />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="pool" element={<Pool />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="todo" element={<Todo />} />
      <Route path="messages" element={<Messages />} />
      <Route path="links" element={<Links />} />
      <Route path="unity" element={<Unity />} />
      <Route path="elevate" element={<Elevate />} />
      <Route path="admin" element={<Admin />} />
    </Route>
  </>
);