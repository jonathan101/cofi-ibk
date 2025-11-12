import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'plan-ahorros',
    loadChildren: () => import('./features/plan-ahorros/plan-ahorros.routes').then(m => m.PLAN_AHORROS_ROUTES)
  },
  {
    path: 'recompensas',
    loadComponent: () => import('./features/recompensas/recompensas.component').then(m => m.RecompensasComponent)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
