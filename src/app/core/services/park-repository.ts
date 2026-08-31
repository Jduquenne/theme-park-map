import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Park, ParkSummary } from '../models';

const DATA_ROOT = 'data';

@Injectable({ providedIn: 'root' })
export class ParkRepository {
  private readonly http = inject(HttpClient);

  loadCatalog(): Observable<ParkSummary[]> {
    return this.http.get<ParkSummary[]>(`${DATA_ROOT}/index.json`);
  }

  loadPark(slug: string): Observable<Park> {
    return this.http.get<Park>(`${DATA_ROOT}/${slug}.json`);
  }
}
