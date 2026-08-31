import { PointOfInterest } from './point-of-interest';
import { YearRange } from './year-range';

export interface RasterImage {
  path: string;
  width: number;
  height: number;
}

export interface HistoricalMap {
  id: string;
  title: string;
  period: YearRange;
  image: RasterImage;
  source: string | null;
  pointsOfInterest: PointOfInterest[];
}
