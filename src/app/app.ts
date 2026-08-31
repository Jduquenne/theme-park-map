import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ParkIndex } from './features/park-index/park-index';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, ParkIndex],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
