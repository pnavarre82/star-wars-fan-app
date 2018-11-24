import { Component, Input } from '@angular/core';
import { SwapiFetcherService } from 'src/app/services/swapi-fetcher/swapi-fetcher.service';
/**
 * Type Component
 *
 * Shows i18n literal directed by @input type
 */
@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent {
  SwapiFetcherService = SwapiFetcherService; // exposed to the view
  private _type: string;

  constructor() {}

  @Input()
  set type(value: string) {
    this._type = value;
  }

  get type(): string {
    return this._type;
  }
}
