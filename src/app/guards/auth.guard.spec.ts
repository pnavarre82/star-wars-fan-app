import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth/authservice.service';
import { MockAuthService } from '../services/auth/authservice.service.spec';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useClass: MockAuthService
        }
      ]
    });
  });

  it('should canActivate return true if isLoged return true', inject(
    [AuthGuard, AuthService],
    (guard: AuthGuard, authService: MockAuthService) => {
      spyOn(authService, 'isLogged').and.returnValue(of(true));
      guard.canActivate().subscribe(result => {
        expect(result).toBeTruthy();
      });
    }
  ));

  it('should canActivate return false if isLoged return false', inject(
    [AuthGuard, AuthService],
    (guard: AuthGuard, authService: MockAuthService) => {
      spyOn(authService, 'isLogged').and.returnValue(of(false));
      guard.canActivate().subscribe(result => {
        expect(result).toBeFalsy();
      });
    }
  ));
});
