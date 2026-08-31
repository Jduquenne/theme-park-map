import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/welcome/welcome').then((m) => m.Welcome),
  },
  {
    path: 'parks/:slug',
    loadComponent: () => import('./features/map-viewer/map-viewer').then((m) => m.MapViewer),
  },
];
