import { PoiCategory } from '../../../core/models';

export const POI_COLOR: Record<PoiCategory, string> = {
  attraction: '#3f6d9e',
  show: '#8a5a9e',
  dining: '#c2622d',
  shop: '#2f8f83',
  service: '#7d7461',
  entrance: '#4b8a48',
  landmark: '#b0487e',
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
