import { lazy, ComponentType } from 'react';

const Login = lazy(() => import('@/pages/Login'));

interface RouteConfig {
  path: string;
  element: ComponentType<any>;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: Login,
  },
];