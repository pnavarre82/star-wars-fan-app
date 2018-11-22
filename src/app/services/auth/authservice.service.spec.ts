import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AuthService } from './authservice.service';
import { Injectable } from '@angular/core';
import { LoginModel } from './models/login.model';
import { Observable, of } from 'rxjs';
import { LoginResponseEnum } from './enums/login-response.enum';
import { getFakeLoginModel } from './models/login.model.spec';

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  describe('login method', () => {
    it('should return LoginResponseEnum.OK if correct username/password', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      service
        .login({
          userName: AuthService.Username,
          password: AuthService.Password
        })
        .subscribe(result => {
          expect(result).toEqual(LoginResponseEnum.OK);
        });
      tick(AuthService.MaxTimeMs);
    }));

    it('should return LoginResponseEnum.WrongUserPass if correct username/password', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      service.login(getFakeLoginModel()).subscribe(result => {
        expect(result).toEqual(LoginResponseEnum.WrongUserPass);
      });
      tick(AuthService.MaxTimeMs);
    }));
  });

  describe('isLogged method', () => {
    it('should return false if never logged in', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      service.isLogged().subscribe(result => {
        expect(result).toBeFalsy();
      });
    }));

    it('should return false after wrong login', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      service.login(getFakeLoginModel());
      tick();
      service.isLogged().subscribe(result => {
        expect(result).toBeFalsy();
      });
    }));

    it('should return true after correct login', fakeAsync(() => {
      const service: AuthService = TestBed.get(AuthService);
      service.login({
        userName: AuthService.Username,
        password: AuthService.Password
      });
      tick();
      service.isLogged().subscribe(result => {
        expect(result).toBeTruthy();
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
