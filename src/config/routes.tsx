import { AppLayout } from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import Leads from "@/pages/Leads";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Changelog from "@/pages/Changelog";
import Calendar from "@/pages/Calendar";
import TodoList from "@/pages/TodoList";
import Admin from "@/pages/Admin";
import LinkedInCallback from "@/pages/auth/callback/LinkedIn";
import InstagramCallback from "@/pages/auth/callback/Instagram";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "@/pages/legal/InstagramDataDeletion";
import News from "@/pages/News";
import Support from "@/pages/Support";

export const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/auth", element: <Auth /> },
  { path: "/register", element: <Register /> },
  { path: "/news", element: <News /> },
  { path: "/support", element: <Support /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/auth/data-deletion/instagram", element: <InstagramDataDeletion /> },
  { path: "/auth/callback/linkedin", element: <LinkedInCallback /> },
  { path: "/auth/callback/instagram", element: <InstagramCallback /> },
];

export const protectedRoutes = [
  { path: "/dashboard", element: <AppLayout><Dashboard /></AppLayout> },
  { path: "/admin", element: <AppLayout><Admin /></AppLayout> },
  { path: "/calendar", element: <AppLayout><Calendar /></AppLayout> },
  { path: "/todo", element: <AppLayout><TodoList /></AppLayout> },
  { path: "/unity", element: <AppLayout><Unity /></AppLayout> },
  { path: "/unity/team/:teamSlug", element: <AppLayout><TeamDetail /></AppLayout> },
  { path: "/elevate", element: <AppLayout><Elevate /></AppLayout> },
  { path: "/elevate/modul/:moduleSlug", element: <AppLayout><PlatformDetail /></AppLayout> },
  { path: "/leads", element: <AppLayout><Leads /></AppLayout> },
  { path: "/messages", element: <AppLayout><Messages /></AppLayout> },
  { path: "/settings", element: <AppLayout><Settings /></AppLayout> },
  { path: "/changelog", element: <AppLayout><Changelog /></AppLayout> },
];