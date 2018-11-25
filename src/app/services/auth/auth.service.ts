import { Injectable } from '@angular/core';
import { LoginModel } from './models/login.model';
import { Observable, of } from 'rxjs';
import { LoginResponseEnum } from './enums/login-response.enum';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from '../local-storage/local-storage.service';

/**
 * Authentication Service
 *
 * responses mocked to simplify task as suggested
 * api errors could be handled here for standardization purposes
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  static Username: string = 'star';
  static Password: string = 'wars';
  static MinTimeMs: number = 4000;
  static MaxTimeMs: number = 6000;
  static LocalStorageKey: string = 'AuthServiceIsLoggedKey';

  constructor(private localStorageService: LocalStorageService) {}
  /**
   * should consume from auth, mocked response instead
   * @param loginModel Data from the login form
   */
  login(loginModel: LoginModel): Observable<LoginResponseEnum> {
    // time to simulate API access delay
    // between MinTimeMs and MaxTimeMs (4000 - 6000) ms
    const delayTimeMs = Math.floor(Math.random() * (AuthService.MaxTimeMs - AuthService.MinTimeMs)) + AuthService.MinTimeMs;

    const isLogged = loginModel && loginModel.userName === AuthService.Username && loginModel.password === AuthService.Password;
    this.localStorageService.setItem(AuthService.LocalStorageKey, isLogged);

    return isLogged ? of(LoginResponseEnum.OK).pipe(delay(delayTimeMs)) : of(LoginResponseEnum.WrongUserPass).pipe(delay(delayTimeMs));
  }

  // observable because should be returned from server
  isLogged(): Observable<boolean> {
    const stored = this.localStorageService.getItem(AuthService.LocalStorageKey);
    const isLogged = stored !== null ? stored : false;
    return of(isLogged);
  }
}
