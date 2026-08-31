import { PointOfInterest } from './point-of-interest';
import { YearRange } from './year-range';

export interface MapImage {
  path: string;
  width: number;
  height: number;
}

export interface HistoricalMap {
  id: string;
  title: string;
  period: YearRange;
  image: MapImage;
  source: string | null;
  pointsOfInterest: PointOfInterest[];
}
