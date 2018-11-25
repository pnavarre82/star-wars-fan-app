import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { tap } from 'rxjs/operators';
import { RoutesPaths } from '../app-routing-paths.class';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): Observable<boolean> {
    return this.authService.isLogged().pipe(
      tap(result => {
        if (!result) {
          this.router.navigate(['/' + RoutesPaths.Loging]);
        }
      })
    );
  }
}
