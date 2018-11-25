import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { LoginModel } from './models/login.model';
import { Observable, of } from 'rxjs';
import { LoginResponseEnum } from './enums/login-response.enum';
import { getFakeLoginModel } from './models/login.model.spec';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { MockLocalStorageService } from '../local-storage/local-storage.service.spec';
import * as faker from 'faker';

describe('AuthService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useClass: MockLocalStorageService
        }
      ]
    })
  );

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  describe('login method', () => {
    it('should return LoginResponseEnum.OK if correct username/password and set true into LocalStorageService', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      const mockLocalStorageService: MockLocalStorageService = TestBed.get(LocalStorageService);
      spyOn(mockLocalStorageService, 'setItem');
      service
        .login({
          userName: AuthService.Username,
          password: AuthService.Password
        })
        .subscribe(result => {
          expect(result).toEqual(LoginResponseEnum.OK);
          expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(AuthService.LocalStorageKey, true);
        });
      tick(AuthService.MaxTimeMs);
    }));

    it('should return LoginResponseEnum.WrongUserPass if correct username/password set false into LocalStorageService', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      const mockLocalStorageService: MockLocalStorageService = TestBed.get(LocalStorageService);
      spyOn(mockLocalStorageService, 'setItem');
      service.login(getFakeLoginModel()).subscribe(result => {
        expect(result).toEqual(LoginResponseEnum.WrongUserPass);
        expect(mockLocalStorageService.setItem).toHaveBeenCalledWith(AuthService.LocalStorageKey, false);
      });
      tick(AuthService.MaxTimeMs);
    }));
  });

  describe('isLogged method', () => {
    it('should get isLogged value from LocalStorageService', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      const mockLocalStorageService: MockLocalStorageService = TestBed.get(LocalStorageService);
      const fakeResult: boolean = faker.random.boolean();
      spyOn(mockLocalStorageService, 'getItem').and.returnValue(fakeResult);
      service.isLogged().subscribe(result => {
        expect(mockLocalStorageService.getItem).toHaveBeenCalledWith(AuthService.LocalStorageKey);
        expect(result).toEqual(fakeResult);
      });
    }));

    it('should return false if null returned from LocalStorageService', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      const mockLocalStorageService: MockLocalStorageService = TestBed.get(LocalStorageService);
      const fakeResult: boolean = faker.random.boolean();
      spyOn(mockLocalStorageService, 'getItem').and.returnValue(null);
      service.isLogged().subscribe(result => {
        expect(result).toEqual(false);
      });
    }));
  });
});

/**
 * AuthService Mock for testing purposes
 */
@Injectable()
export class MockAuthService {
  constructor() {}
  login(data: LoginModel): Observable<LoginResponseEnum> {
    return of(LoginResponseEnum.OK);
  }
  isLogged(): Observable<boolean> {
    return of(true);
  }
}
