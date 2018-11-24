import { Injectable } from '@angular/core';

const jsonDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

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

  setItem(key: string, value: any) {
    window.localStorage[key] = JSON.stringify(value);
  }

  getItem(key: string): any {
    const storagedString = window.localStorage[key];
    return storagedString == null ? undefined : JSON.parse(storagedString, this.dateReviver);
  }

  private dateReviver(key, value) {
    if (typeof value === 'string' && jsonDateFormat.test(value)) {
      return new Date(value);
    }

    return value;
  }
}
