import { Injectable } from '@angular/core';
import { LoginModel } from './models/login.model';
import { Observable, of } from 'rxjs';
import { LoginResponseEnum } from './enums/login-response.enum';
import { delay } from 'rxjs/operators';

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

  constructor() {}
  /**
   * should consume from auth, mocked response instead
   * @param loginModel Data from the login form
   */
  login(loginModel: LoginModel): Observable<LoginResponseEnum> {
    // time to simulate API access delay
    // between MinTimeMs and MaxTimeMs (4000 - 6000) ms
    const delayTimeMs =
      Math.floor(
        Math.random() * (AuthService.MaxTimeMs - AuthService.MinTimeMs)
      ) + AuthService.MinTimeMs;

    return loginModel &&
      loginModel.userName === AuthService.Username &&
      loginModel.password === AuthService.Password
      ? of(LoginResponseEnum.OK).pipe(delay(delayTimeMs))
      : of(LoginResponseEnum.WrongUserPass).pipe(delay(delayTimeMs));
  }
}
