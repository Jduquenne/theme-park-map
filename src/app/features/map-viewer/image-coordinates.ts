import { LatLngTuple, latLngBounds, type LatLngBounds } from 'leaflet';
import { MapImage, PixelPoint } from '../../core/models';

export function imageBounds(image: MapImage): LatLngBounds {
  const southWest: LatLngTuple = [0, 0];
  const northEast: LatLngTuple = [image.height, image.width];
  return latLngBounds(southWest, northEast);
}

export function imagePointToLatLng(point: PixelPoint, image: MapImage): LatLngTuple {
  return [image.height - point.y, point.x];
}
