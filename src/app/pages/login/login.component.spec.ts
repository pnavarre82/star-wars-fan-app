import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';
import { By } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MockAuthService } from 'src/app/services/auth/auth.service.spec';
import { LoginModel } from 'src/app/services/auth/models/login.model';
import { getFakeLoginModel } from 'src/app/services/auth/models/login.model.spec';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginResponseEnum } from 'src/app/services/auth/enums/login-response.enum';
import * as faker from 'faker';
import { Router } from '@angular/router';
import { RoutesPaths } from 'src/app/app-routing-paths.class';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  class MockRouterService {
    navigate() {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: Router,
          useClass: MockRouterService
        }
      ],

      imports: [ReactiveFormsModule, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shouldn‘t show validators after creation', () => {
    const usernameRequiredFeedback = fixture.debugElement.query(By.css('[name=usernameRequiredFeedback]'));
    const wrongUserPassFeedback = fixture.debugElement.query(By.css('[name=wrongUserPassFeedback]'));
    const passwordRequiredFeedback = fixture.debugElement.query(By.css('[name=passwordRequiredFeedback]'));
    expect(usernameRequiredFeedback).toBeNull();
    expect(wrongUserPassFeedback).toBeNull();
    expect(passwordRequiredFeedback).toBeNull();
  });

  it('shouldn‘t containt form.was-validated', () => {
    const formWasValidated = fixture.debugElement.query(By.css('form.was-validated'));
    expect(formWasValidated).toBeNull();
  });

  it('should add .was-validated to form after submit', () => {
    submit();
    const formWasValidated = fixture.debugElement.query(By.css('form.was-validated'));
    expect(formWasValidated).not.toBeNull();
  });

  it('should show validators if empty and clicked submit button', () => {
    submit();

    const usernameRequiredFeedback = fixture.debugElement.query(By.css('[name=usernameRequiredFeedback]'));
    const passwordRequiredFeedback = fixture.debugElement.query(By.css('[name=passwordRequiredFeedback]'));
    expect(usernameRequiredFeedback).not.toBeNull();
    expect(passwordRequiredFeedback).not.toBeNull();
  });

  it('shouldn‘t show empty validators after submit if user/pass', () => {
    setLoginValues();
    submit();

    const usernameRequiredFeedback = fixture.debugElement.query(By.css('[name=usernameRequiredFeedback]'));
    const passwordRequiredFeedback = fixture.debugElement.query(By.css('[name=passwordRequiredFeedback]'));
    expect(usernameRequiredFeedback).toBeNull();
    expect(passwordRequiredFeedback).toBeNull();
  });

  it('shouldn‘t invoke AuthService.login if passwordControl invalid', inject([AuthService], (mockAuthService: MockAuthService) => {
    spyOnProperty(component.passwordControl, 'valid', 'get').and.returnValue(false);
    spyOn(mockAuthService, 'login');
    submit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  }));

  it('shouldn‘t invoke AuthService.login if usernameControl invalid', inject([AuthService], (mockAuthService: MockAuthService) => {
    spyOnProperty(component.usernameControl, 'valid', 'get').and.returnValue(false);
    spyOn(mockAuthService, 'login');
    submit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  }));

  it('should show expected validators and clean password if user/pass set submitted and wrongUserPass received', fakeAsync(
    inject([AuthService], (mockAuthService: MockAuthService) => {
      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.WrongUserPass));
      setLoginValues();
      submit();
      tick();
      fixture.detectChanges();
      const wrongUserPassFeedback = fixture.debugElement.query(By.css('[name=wrongUserPassFeedback]'));
      const passwordRequiredFeedback = fixture.debugElement.query(By.css('[name=passwordRequiredFeedback]'));
      expect(wrongUserPassFeedback).not.toBeNull();
      expect(passwordRequiredFeedback).toBeNull();
      expect(component.passwordControl.value).toBeNull();
    })
  ));

  it('should disable wrongUserPass after password change', fakeAsync(
    inject([AuthService], (mockAuthService: MockAuthService) => {
      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.WrongUserPass));
      setLoginValues();
      submit();
      tick();
      fixture.detectChanges();
      setLoginValues();
      const wrongUserPassFeedback = fixture.debugElement.query(By.css('[name=wrongUserPassFeedback]'));
      expect(wrongUserPassFeedback).toBeNull();
    })
  ));

  it('should invoke AuthService.login with introduced values if user/pass submitted', inject(
    [AuthService],
    (mockAuthService: MockAuthService) => {
      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.OK));
      const loginModel = setLoginValues();
      submit();
      expect(mockAuthService.login).toHaveBeenCalledWith(loginModel);
    }
  ));

  it('should show loading-cloak during login', fakeAsync(
    inject([AuthService], (mockAuthService: MockAuthService) => {
      const delayTime = faker.random.number({ min: 4000, max: 10000 });
      let loadingCloak = fixture.debugElement.query(By.css('.loading-cloak'));
      expect(loadingCloak).toBeNull();

      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.OK).pipe(delay(delayTime)));
      setLoginValues();
      submit();

      loadingCloak = fixture.debugElement.query(By.css('.loading-cloak'));
      expect(loadingCloak).not.toBeNull();
      tick(delayTime);
      fixture.detectChanges();
      loadingCloak = fixture.debugElement.query(By.css('.loading-cloak'));
      expect(loadingCloak).toBeNull();
    })
  ));

  it('should redirect to List afte correct login', inject(
    [AuthService, Router],
    (mockAuthService: MockAuthService, mockRouterService: MockRouterService) => {
      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.OK));
      spyOn(mockRouterService, 'navigate');
      setLoginValues();
      submit();
      expect(mockRouterService.navigate).toHaveBeenCalledWith(['/' + RoutesPaths.List]);
    }
  ));

  it('should prevent double submit', fakeAsync(
    inject([AuthService], (mockAuthService: MockAuthService) => {
      const delayTime = faker.random.number({ min: 4000, max: 10000 });
      spyOn(mockAuthService, 'login').and.returnValue(of(LoginResponseEnum.OK).pipe(delay(delayTime)));
      setLoginValues();
      submit();
      submit();

      tick(delayTime);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
    })
  ));

  function submit() {
    const buttonSubmit = fixture.debugElement.query(By.css('button[type=submit]'));
    buttonSubmit.nativeElement.click();
    fixture.detectChanges();
  }

  function setLoginValues(): LoginModel {
    const loginModel: LoginModel = getFakeLoginModel();
    const usernameControl = fixture.debugElement.query(By.css('[id=username]'));
    const passwordControl = fixture.debugElement.query(By.css('[id=password]'));
    usernameControl.nativeElement.value = loginModel.userName;
    usernameControl.nativeElement.dispatchEvent(new Event('input'));
    passwordControl.nativeElement.value = loginModel.password;
    passwordControl.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return loginModel;
  }
});
