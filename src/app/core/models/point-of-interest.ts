import { YearRange } from './year-range';

export type PoiCategory =
  | 'attraction'
  | 'show'
  | 'dining'
  | 'shop'
  | 'service'
  | 'entrance'
  | 'landmark';

export interface PixelPoint {
  x: number;
  y: number;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: PoiCategory;
  position: PixelPoint;
  description: string | null;
  operating: YearRange | null;
}
