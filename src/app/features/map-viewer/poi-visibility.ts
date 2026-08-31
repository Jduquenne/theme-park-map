import { YearRange } from '../../core/models';

export function isActiveInYear(operating: YearRange | null, year: number): boolean {
  if (!operating) {
    return true;
  }
  const hasOpened = year >= operating.from;
  const stillStanding = operating.to === null || year <= operating.to;
  return hasOpened && stillStanding;
}

export function resolveOpenEnd(range: YearRange, fallback: number): number {
  return range.to ?? fallback;
}
