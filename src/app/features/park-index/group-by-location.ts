import { ParkSummary } from '../../core/models';

export interface ParkGroup {
  country: string;
  parks: ParkSummary[];
}

export function groupByCountry(parks: readonly ParkSummary[]): ParkGroup[] {
  const byCountry = new Map<string, ParkSummary[]>();
  for (const park of parks) {
    const bucket = byCountry.get(park.location.country) ?? [];
    bucket.push(park);
    byCountry.set(park.location.country, bucket);
  }

  return [...byCountry.entries()]
    .map(([country, group]) => ({ country, parks: group.sort(compareByCityThenName) }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

function compareByCityThenName(a: ParkSummary, b: ParkSummary): number {
  return a.location.city.localeCompare(b.location.city) || a.name.localeCompare(b.name);
}
