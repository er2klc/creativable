import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";
import News from "@/pages/News";
import Support from "@/pages/Support";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import InstagramDataDeletion from "@/pages/legal/InstagramDataDeletion";
import LinkedInCallback from "@/pages/auth/callback/LinkedIn";
import InstagramCallback from "@/pages/auth/callback/Instagram";
import TreeProfile from "@/pages/TreeProfile";

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
  { path: "/tree/:slug", element: <TreeProfile /> },
];