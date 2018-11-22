import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';

describe('LocalstorageserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
    let store: { [key: string]: string } = {};

    // prevent using real localStorage
    spyOn(localStorage, 'getItem').and.callFake(function(key) {
      return store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake(function(key, value) {
      return (store[key] = value + '');
    });
    spyOn(localStorage, 'clear').and.callFake(function() {
      store = {};
    });
  });

  it('should be created', () => {
    const service: LocalStorageService = TestBed.get(LocalStorageService);
    expect(service).toBeTruthy();
  });
});
