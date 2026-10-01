# ParkMapHistory

**Les plans des parcs d'attractions, à travers le temps.**

🗺️ **Démo : https://jduquenne.github.io/theme-park-map/**

ParkMapHistory est une archive cartographique interactive des parcs de loisirs du monde entier, ouverts comme disparus. Chaque parc peut avoir plusieurs plans historiques (un par époque), sur lesquels sont positionnées ses attractions. Une « machine à remonter le temps » permet de voir ce qu'était le parc en 1995, en 2008 ou aujourd'hui.

## Pourquoi cette app ?

Les plans de parcs sont éparpillés (brochures papier, forums de passionnés, archives web) et rarement exploitables : une image figée, sans légende, sans contexte, sans moyen de comparer deux époques. Pourtant, un parc évolue en permanence : attractions ajoutées, déplacées, détruites, zones rebaptisées.

ParkMapHistory répond à trois besoins :

- **Retrouver** un plan d'époque et le consulter confortablement, de la tablette au smartphone.
- **Comprendre** ce qu'on regarde : chaque attraction est un point cliquable, classé par catégorie (manège, spectacle, restauration…), avec sa période d'existence.
- **Comparer** les époques : on navigue d'une année à l'autre et seules les attractions présentes cette année-là s'affichent.

L'ambition est de couvrir tous les parcs du monde. Le catalogue démarre avec **37 parcs français** (les 25 plus fréquentés et 12 parcs disparus ou emblématiques) avec leur fréquentation, leurs dates d'exploitation et leur logo. Les plans et leurs attractions sont ajoutés parc par parc.

## Fonctionnalités

- **Catalogue** : liste filtrable (recherche, statut ouvert/fermé, pays) et triable (nom, fréquentation, ancienneté).
- **Visionneuse de plans** : zoom et déplacement fluides sur l'image du plan, plein écran.
- **Time machine** : choix de l'époque du plan et de l'année, les attractions se filtrent en conséquence.
- **Attractions** : pins par catégorie, liste, fiche détaillée, filtre par catégorie.
- **Liens partageables** : plan, année, attraction sélectionnée et filtres sont stockés dans l'URL.
- **Mobile d'abord** : *bottom sheet* déplaçable au doigt, contrôles flottants, menu plein écran, zones sûres (encoche) prises en compte.
- **Accessibilité** : navigation clavier, focus visible, rôles ARIA, respect de `prefers-reduced-motion`.

## Stack technique

| Domaine | Choix |
| --- | --- |
| Framework | [Angular 21](https://angular.dev), composants *standalone* uniquement, sans zone.js |
| État | Signals (`signal`, `computed`, `linkedSignal`, `effect`), pas de NgRx |
| Templates | Control flow moderne (`@if`, `@for`, `@defer`, `@switch`) |
| Cartographie | [Leaflet](https://leafletjs.com) en `L.CRS.Simple` : le plan est une image raster, pas une carte géographique |
| Style | [Tailwind CSS v4](https://tailwindcss.com) (tokens dans un bloc `@theme`), Oswald et Inter |
| Langage | TypeScript strict, aucun `any` |
| Données | Fichiers JSON statiques dans `public/data/`, sans backend |
| Hébergement | GitHub Pages, déployé par GitHub Actions |

### Choix d'architecture

- **100 % statique** : le « backend » est un dossier de JSON typés par des interfaces (`Park`, `HistoricalMap`, `PointOfInterest`…). Aucun serveur, aucune base de données.
- **Organisation par domaine** : `core/` (services, modèles), `shared/` (utilitaires et UI réutilisables), `features/` (`park-index`, `welcome`, `map-viewer`, `poi-editor`).
- **Requêtes** : `HttpClient` encapsulé dans un `ParkRepository`, états de chargement modélisés par un type `RequestState<T>` (loading / error / loaded).
- **État dans l'URL** : un helper `queryParamsState` synchronise des signals avec les query params, avec *debounce* et `replaceUrl`.
- **Gestes codés à la main** : le *bottom sheet* mobile repose sur les Pointer Events, sans bibliothèque.

## Démarrer en local

Prérequis : Node.js 22+ et npm.

```bash
npm ci
npm start
```

L'app est servie sur http://localhost:4200/.

Build de production :

```bash
npx ng build --configuration production
```

## Structure des données

```
public/
├── data/
│   ├── index.json          # catalogue : résumé de chaque parc
│   └── <slug>.json         # un parc : infos, plans historiques, attractions
├── logos/                  # logos des parcs
└── maps/<slug>/            # images des plans, un dossier par parc
```

Un plan est déclaré dans le JSON du parc avec son image (chemin et dimensions réelles en pixels), sa période et sa source. Ses attractions (`pointsOfInterest`) portent une position en pixels sur l'image, une catégorie et leurs années d'existence.

## Éditeur d'attractions (dev uniquement)

Placer les attractions à la main dans le JSON serait fastidieux. En développement, l'éditeur visuel est disponible sur `/parks/<slug>/edit` :

- clic sur le plan pour placer une attraction, glisser pour la déplacer ;
- copie des attractions depuis le plan d'une autre année, pour ne pas tout replacer à chaque époque ;
- enregistrement direct dans `public/data/<slug>.json` via la File System Access API (navigateur Chromium requis).

Cet outil **n'est jamais embarqué en production** : le build de prod remplace `app.routes.ts` par `app.routes.prod.ts` (`fileReplacements` dans `angular.json`), ce qui supprime la route et son chunk du bundle. Le workflow de déploiement vérifie son absence.

## Contribuer un plan

1. Déposer l'image dans `public/maps/<slug>/<année>.jpg`.
2. Déclarer le plan dans `public/data/<slug>.json` (identifiant, titre, période, chemin et dimensions de l'image, source).
3. Lancer `npm start`, ouvrir `/parks/<slug>/edit` et placer les attractions.
4. Vérifier le rendu sur `/parks/<slug>`.

## Déploiement

Chaque push sur `master` déclenche `.github/workflows/deploy.yml` :

1. build de production avec `--base-href /theme-park-map/` (le site est servi dans un sous-dossier) ;
2. vérification que l'éditeur est absent du bundle ;
3. copie de `index.html` en `404.html`, pour que les liens directs (`/parks/futuroscope`) fonctionnent malgré l'absence de réécriture d'URL sur GitHub Pages ;
4. publication sur GitHub Pages.

Réglage requis une seule fois : *Settings → Pages → Source : GitHub Actions*.
