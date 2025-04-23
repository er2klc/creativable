import { lazy } from "react";

// Lazy loaded public components
const PresentationPage = lazy(() => import("@/pages/presentation/[pageId]"));
const Auth = lazy(() => import("@/pages/Auth"));
const Register = lazy(() => import("@/pages/Register"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const InstagramDataDeletion = lazy(() => import("@/pages/legal/InstagramDataDeletion"));
const Index = lazy(() => import("@/pages/Index"));

export const publicRoutes = [
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />,
  },
  {
    path: "/auth/data-deletion/instagram",
    element: <InstagramDataDeletion />,
  },
  {
    path: "/presentation/:leadId/:pageId",
    element: <PresentationPage />,
  },
];

