import { TestBed } from '@angular/core/testing';
import * as faker from 'faker';

import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';

describe('LocalstorageserviceService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(LocalStorageService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getItem return undefined if key not set', () => {
    expect(service.getItem(faker.random.word())).toBeUndefined();
  });

  it('should getItem expected object if setItem previously invoked (also parse dates)', () => {
    const key = faker.random.word();
    const fakeObject = faker.helpers.createCard();
    service.setItem(key, fakeObject);
    const returnedObject = service.getItem(key);
    expect(returnedObject).toEqual(fakeObject);
  });
});

@Injectable()
export class MockLocalStorageService {
  store: { [key: string]: any } = {};

  constructor() {}
  setItem(key: string, value: any) {
    this.store[key] = value;
  }

  getItem(key: string): any {
    return this.store[key];
  }
}
