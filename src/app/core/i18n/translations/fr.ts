import { Translations } from './en';

export const fr: Translations = {
  meta: {
    title: "ParkMapHistory – Plans historiques des parcs d'attractions du monde entier",
    description:
      "Archive interactive des plans historiques de parcs d'attractions. Parcourez les parcs du monde entier à travers les années et explorez leurs attractions sur des plans d'époque.",
  },
  language: {
    label: 'Langue',
  },
  common: {
    retry: 'Réessayer',
    now: 'auj.',
    logoAlt: (parkName: string) => `Logo de ${parkName}`,
  },
  welcome: {
    title: 'Les archives des plans de parcs',
    intro:
      "Parcourez les plans historiques des parcs d'attractions au fil des décennies. Choisissez un parc dans l'index à gauche pour ouvrir ses plans, ses points d'intérêt et sa frise chronologique.",
    summary: (parkCount: number, countryCount: number) =>
      `${parkCount} parc${parkCount > 1 ? 's' : ''} · ${countryCount} pays`,
  },
  parkIndex: {
    title: 'Index des parcs',
    parkCount: (count: number) => `parc${count > 1 ? 's' : ''}`,
    searchPlaceholder: 'Rechercher un parc…',
    searchLabel: 'Rechercher un parc',
    sortBy: {
      name: 'Trier par nom',
      visitors: 'Trier par fréquentation',
      opened: "Trier par année d'ouverture",
    },
    sortLabel: {
      name: { asc: 'A–Z', desc: 'Z–A' },
      visitors: { asc: 'Moins', desc: 'Plus' },
      opened: { asc: 'Anciens', desc: 'Récents' },
    },
    status: {
      all: 'Tous',
      open: 'Ouverts',
      closed: 'Fermés',
    },
    countryLabel: 'Filtrer par pays',
    allCountries: 'Tous les pays',
    clearFilters: 'Effacer les filtres',
    visitors: 'visiteurs',
    empty: 'Aucun parc des archives ne correspond à vos filtres.',
    loadError: "Les archives n'ont pas pu être chargées.",
    loading: 'Chargement des archives',
  },
  mapViewer: {
    backToArchive: '‹ Archives',
    attendance: (count: string, year: number | null) =>
      year === null ? `≈ ${count} visiteurs / an` : `≈ ${count} visiteurs (${year})`,
    mapRegion: 'Plan historique du parc',
    openIndex: "Ouvrir l'index des parcs",
    closeIndex: "Fermer l'index des parcs",
    noMap: "Aucun plan historique n'est encore enregistré pour ce parc.",
    enterFullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    loadError: "Les archives de ce parc n'ont pas pu être chargées.",
    loading: 'Chargement des archives du parc',
  },
  timeline: {
    title: 'Voyage dans le temps',
    mapNav: 'Plan historique',
    earlierYears: 'Années précédentes',
    laterYears: 'Années suivantes',
    previousYear: 'Année précédente',
    nextYear: 'Année suivante',
  },
  poi: {
    title: "Points d'intérêt",
    toggleSheet: "Déplier ou replier la liste des points d'intérêt",
    backToList: '‹ Tous les points',
    activeYears: (from: number, to: number | null) =>
      to === null ? `En activité depuis ${from}` : `En activité ${from}–${to}`,
    noDescription: 'Aucune description enregistrée.',
    noneVisible: 'Aucun point visible cette année-là.',
    showAll: 'Tous',
    toggleCategory: (category: string) => `Afficher ou masquer : ${category}`,
  },
  poiCategory: {
    attraction: 'Attraction',
    show: 'Spectacle',
    dining: 'Restauration',
    shop: 'Boutique',
    service: 'Service',
    entrance: 'Entrée',
    landmark: 'Monument',
  },
};
