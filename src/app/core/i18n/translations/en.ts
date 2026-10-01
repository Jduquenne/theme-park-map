import { PoiCategory } from '../../models';

export const en = {
  meta: {
    title: 'ParkMapHistory – Historical maps of theme parks worldwide',
    description:
      'An interactive archive of historical theme park maps. Browse parks from around the world through the years and explore their attractions on period plans.',
  },
  language: {
    label: 'Language',
  },
  common: {
    retry: 'Retry',
    now: 'now',
    logoAlt: (parkName: string) => `${parkName} logo`,
  },
  welcome: {
    title: 'The park map archive',
    intro:
      'Browse historical theme-park plans across the decades. Pick a park from the index on the left to open its maps, points of interest and timeline.',
    summary: (parkCount: number, countryCount: number) =>
      `${parkCount} park${parkCount === 1 ? '' : 's'} · ${countryCount} countr${countryCount === 1 ? 'y' : 'ies'}`,
  },
  parkIndex: {
    title: 'Parks index',
    parkCount: (count: number) => `park${count === 1 ? '' : 's'}`,
    searchPlaceholder: 'Search parks…',
    searchLabel: 'Search parks',
    sortBy: {
      name: 'Sort by name',
      visitors: 'Sort by visitors',
      opened: 'Sort by opening year',
    },
    sortLabel: {
      name: { asc: 'A–Z', desc: 'Z–A' },
      visitors: { asc: 'Fewest', desc: 'Most' },
      opened: { asc: 'Oldest', desc: 'Newest' },
    },
    status: {
      all: 'All',
      open: 'Open',
      closed: 'Closed',
    },
    countryLabel: 'Filter by country',
    allCountries: 'All countries',
    clearFilters: 'Clear filters',
    visitors: 'visitors',
    empty: 'No park in the archive matches your filters.',
    loadError: 'The archive could not be loaded.',
    loading: 'Loading park archive',
  },
  mapViewer: {
    backToArchive: '‹ Archive',
    attendance: (count: string, year: number | null) =>
      year === null ? `≈ ${count} visitors / year` : `≈ ${count} visitors (${year})`,
    mapRegion: 'Historical park map',
    openIndex: 'Open the parks index',
    closeIndex: 'Close the parks index',
    noMap: 'No historical map recorded for this park yet.',
    enterFullscreen: 'Full screen',
    exitFullscreen: 'Exit full screen',
    loadError: 'This park archive could not be loaded.',
    loading: 'Loading park archive',
  },
  timeline: {
    title: 'Time machine',
    mapNav: 'Historical map',
    earlierYears: 'Earlier years',
    laterYears: 'Later years',
    previousYear: 'Previous year',
    nextYear: 'Next year',
  },
  poi: {
    title: 'Points of interest',
    toggleSheet: 'Expand or collapse the points of interest list',
    backToList: '‹ All points',
    activeYears: (from: number, to: number | null) =>
      to === null ? `Active since ${from}` : `Active ${from}–${to}`,
    noDescription: 'No description recorded.',
    noneVisible: 'No points visible at this year.',
    showAll: 'All',
    toggleCategory: (category: string) => `Toggle ${category} markers`,
  },
  poiCategory: {
    attraction: 'Attraction',
    show: 'Show',
    dining: 'Dining',
    shop: 'Shop',
    service: 'Service',
    entrance: 'Entrance',
    landmark: 'Landmark',
  } satisfies Record<PoiCategory, string>,
};

export type Translations = typeof en;
