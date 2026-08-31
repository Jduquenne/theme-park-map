import { ParkLocation } from './park-location';
import { YearRange } from './year-range';

export interface ParkSummary {
  id: string;
  slug: string;
  name: string;
  resort: string | null;
  location: ParkLocation;
  mappedPeriod: YearRange;
  mapCount: number;
}
