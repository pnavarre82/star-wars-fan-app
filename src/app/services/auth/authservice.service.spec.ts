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

/**
 * AuthService Mock for testing purposes
 */
@Injectable()
export class MockAuthService {
  constructor() {}
  login(data: LoginModel): Observable<LoginResponseEnum> {
    return of(LoginResponseEnum.OK);
  }
}
