import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'parks/:slug',
    loadComponent: () => import('./features/map-viewer/map-viewer').then((m) => m.MapViewer),
  },
  {
    path: '',
    redirectTo: 'parks/aurora-gardens',
    pathMatch: 'full',
  },
];
