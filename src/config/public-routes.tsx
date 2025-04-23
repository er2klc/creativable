import { lazy } from "react";

// Lazy loaded public components
const PresentationPage = lazy(() => import("@/pages/presentation/[pageId]"));
const Auth = lazy(() => import("@/pages/Auth"));
const Register = lazy(() => import("@/pages/Register"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/PrivacyPolicy"));
const InstagramDataDeletion = lazy(() => import("@/pages/legal/InstagramDataDeletion"));
const Index = lazy(() => import("@/pages/Index"));

// Füge Suspense-Fallback zu jeder Komponente hinzu
const withSuspense = (Component) => (
  <Component />
);

export const publicRoutes = [
  {
    path: "/",
    element: withSuspense(Index),
  },
  {
    path: "/auth",
    element: withSuspense(Auth),
  },
  {
    path: "/register",
    element: withSuspense(Register),
  },
  {
    path: "/privacy-policy",
    element: withSuspense(PrivacyPolicy),
  },
  {
    path: "/auth/data-deletion/instagram",
    element: withSuspense(InstagramDataDeletion),
  },
  {
    path: "/presentation/:leadId/:pageId",
    element: withSuspense(PresentationPage),
  },
];

