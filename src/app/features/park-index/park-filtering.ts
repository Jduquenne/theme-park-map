import { ParkSummary } from '../../core/models';

export type ParkSort = 'name' | 'visitors' | 'opened';
export type SortDirection = 'asc' | 'desc';
export type ParkStatus = 'all' | 'open' | 'closed';

export interface ParkFilters {
  query: string;
  sort: ParkSort;
  direction: SortDirection;
  status: ParkStatus;
  country: string;
}

// The direction each sort snaps to when first picked (name A→Z, most visitors, oldest first).
export const DEFAULT_DIRECTION: Record<ParkSort, SortDirection> = {
  name: 'asc',
  visitors: 'desc',
  opened: 'asc',
};

export function filterAndSortParks(
  parks: readonly ParkSummary[],
  filters: ParkFilters,
): ParkSummary[] {
  const term = filters.query.trim().toLowerCase();
  const matched = parks.filter((park) => {
    if (term && !matches(park, term)) {
      return false;
    }
    if (filters.country !== 'all' && park.location.country !== filters.country) {
      return false;
    }
    if (filters.status === 'open' && park.operating.to !== null) {
      return false;
    }
    if (filters.status === 'closed' && park.operating.to === null) {
      return false;
    }
    return true;
  });
  const sign = filters.direction === 'asc' ? 1 : -1;
  return matched.sort((a, b) => sign * ASCENDING[filters.sort](a, b));
}

export function countriesOf(parks: readonly ParkSummary[]): string[] {
  return [...new Set(parks.map((park) => park.location.country))].sort((a, b) =>
    a.localeCompare(b),
  );
}

const ASCENDING: Record<ParkSort, (a: ParkSummary, b: ParkSummary) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  visitors: (a, b) => visitorsOf(a) - visitorsOf(b) || a.name.localeCompare(b.name),
  opened: (a, b) => a.operating.from - b.operating.from || a.name.localeCompare(b.name),
};

function visitorsOf(park: ParkSummary): number {
  return park.attendance?.visitors ?? -1;
}

function matches(park: ParkSummary, term: string): boolean {
  return (
    park.name.toLowerCase().includes(term) ||
    park.location.city.toLowerCase().includes(term) ||
    (park.resort?.toLowerCase().includes(term) ?? false)
  );
}
