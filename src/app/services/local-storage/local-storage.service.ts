import { Injectable } from '@angular/core';

/**
 * Wrap localStorage dependency
 *
 * WARNING: this class depends on localStorage from the browser not injected
 *
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() {}
}
