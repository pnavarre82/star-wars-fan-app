import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth/authservice.service';
import { MockAuthService } from '../services/auth/authservice.service.spec';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RoutesPaths } from '../app-routing-paths.class';

describe('AuthGuard', () => {
  class MockRouterService {
    navigate() {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: Router,
          useClass: MockRouterService
        }
      ]
    });
  });

  it('should canActivate return true if isLoged return true', done => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, authService: MockAuthService) => {
      spyOn(authService, 'isLogged').and.returnValue(of(true));
      guard.canActivate().subscribe(result => {
        expect(result).toBeTruthy();
        done();
      });
    })();
  });

  it('should canActivate return false and navigate to /login if isLoged return false', done => {
    inject([AuthGuard, AuthService], (guard: AuthGuard, authService: MockAuthService) => {
      const mockRouter: MockRouterService = TestBed.get(Router);
      spyOn(authService, 'isLogged').and.returnValue(of(false));
      spyOn(mockRouter, 'navigate');
      guard.canActivate().subscribe(result => {
        expect(result).toBeFalsy();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/' + RoutesPaths.Loging]);
        done();
      });
    })();
  });
});
