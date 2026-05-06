import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-services-page',
  templateUrl: './services.html',
  styleUrl: './services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {}
