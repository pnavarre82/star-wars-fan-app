import { Component, OnInit, Input } from '@angular/core';

/**
 * Status component
 * depending on @Input status
 * loading: show loading animation
 * loading-error: show error icon
 * loaded: show nothing
 */
@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  @Input()
  status: StatusOptions;

  constructor() {}

  ngOnInit() {}
}
/**
 * States allowed in StatusComponent
 */
export type StatusOptions = 'loading' | 'loaded' | 'loading-error';
