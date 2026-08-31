import { HistoricalMap } from './historical-map';
import { ParkLocation } from './park-location';
import { YearRange } from './year-range';

export interface Park {
  id: string;
  slug: string;
  name: string;
  resort: string | null;
  location: ParkLocation;
  operating: YearRange;
  description: string;
  maps: HistoricalMap[];
}
