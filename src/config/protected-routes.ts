import { lazy, ComponentType } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

interface RouteConfig {
  path: string;
  element: ComponentType<any>;
}

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: Dashboard,
  },
  {
    path: '/profile',
    element: Profile,
  },
];