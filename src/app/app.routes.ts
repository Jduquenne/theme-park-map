import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/park-catalog/park-catalog').then((m) => m.ParkCatalog),
  },
  {
    path: 'parks/:slug',
    loadComponent: () => import('./features/map-viewer/map-viewer').then((m) => m.MapViewer),
  },
];
