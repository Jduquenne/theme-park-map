import { Attendance } from './attendance';
import { ParkLocation } from './park-location';
import { YearRange } from './year-range';

export interface ParkSummary {
  id: string;
  slug: string;
  name: string;
  resort: string | null;
  location: ParkLocation;
  operating: YearRange;
  attendance: Attendance | null;
  logo: string | null;
  mapCount: number;
}
