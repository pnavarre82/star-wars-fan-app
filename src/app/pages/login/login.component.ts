import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Validators, FormControl, ValidationErrors } from '@angular/forms';
import { AuthService } from 'src/app/services/auth/authservice.service';
import { LoginResponseEnum } from 'src/app/services/auth/enums/login-response.enum';
import { Router } from '@angular/router';
import { RoutesPaths } from 'src/app/app-routing.module';

/**
 * Entry component for the app
 * allows the user to login filling username/passwords using AuthService
 * and redirects to "/list" if is completed
 */
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('username') usernameControlInput: ElementRef;
  usernameControl: FormControl;
  passwordControl: FormControl;
  submitted: boolean = false;
  wrongUserPass: boolean = false;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {
    this.usernameControl = new FormControl(null, [Validators.required]);
    this.passwordControl = new FormControl(null, Validators.required);
    this.passwordControl.valueChanges.subscribe(() => {
      // wrongUserPass condition included to avoid unnecesary updateValueAndValidity invokes
      if (this.passwordControl.value && this.wrongUserPass) {
        this.wrongUserPass = false;
        this.usernameControl.updateValueAndValidity();
      }
    });
  }

  ngOnInit() {}

  login(): void {
    this.submitted = true;
    if (this.passwordControl.valid && this.usernameControl.valid) {
      this.loading = true;
      this.authService
        .login({
          userName: this.usernameControl.value,
          password: this.passwordControl.value
        })
        .subscribe(result => {
          switch (result) {
            case LoginResponseEnum.OK:
              this.router.navigate([RoutesPaths.List]);
              break;
            case LoginResponseEnum.WrongUserPass:
              this.submitted = false;
              this.wrongUserPass = true;
              this.passwordControl.setValue(null);
              this.usernameControl.updateValueAndValidity();
              break;
          }
        })
        // finally
        .add(() => {
          this.loading = false;
        });
    }
  }
}
