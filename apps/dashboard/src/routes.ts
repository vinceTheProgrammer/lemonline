import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import("./pages/home")),
  },
  {
    path: '/oauth/authorize',
    component: lazy(() => import("./pages/authorize")),
  },
  {
    path: '/profile',
    component: lazy(() => import("./pages/profile")),
  },
  {
    path: '/leaderboard',
    component: lazy(() => import("./pages/leaderboard")),
  },
  {
    path: '/admin',
    component: lazy(() => import("./pages/admin/admin")),
    children: [
      {
        path: '/xp',
        component: lazy(() => import("./pages/admin/xp")),
      },
      {
        path: '/levels',
        component: lazy(() => import("./pages/admin/levels")),
      },
      {
        path: '/level-roles',
        component: lazy(() => import("./pages/admin/level-roles")),
      },
      {
        path: '/members',
        component: lazy(() => import("./pages/admin/members")),
      },
    ]
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
