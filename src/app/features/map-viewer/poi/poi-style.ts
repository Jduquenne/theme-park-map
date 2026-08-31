import { PoiCategory } from '../../../core/models';

export const POI_COLOR: Record<PoiCategory, string> = {
  attraction: '#2563eb',
  show: '#7c3aed',
  dining: '#ea580c',
  shop: '#0d9488',
  service: '#64748b',
  entrance: '#16a34a',
  landmark: '#db2777',
};

export const POI_LABEL: Record<PoiCategory, string> = {
  attraction: 'Attraction',
  show: 'Show',
  dining: 'Dining',
  shop: 'Shop',
  service: 'Service',
  entrance: 'Entrance',
  landmark: 'Landmark',
};
