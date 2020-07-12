import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController, Platform } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { forkJoin, from } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Logger, untilDestroyed } from '@core';
import { AuthenticationService } from './authentication.service';
import { NoWhiteSpaceValidator } from '@shared/validators/noWhiteSpace.validator';
import { EmailValidator } from '@shared/validators/email.validator';
const log = new Logger('Login');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private platform: Platform,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService
  ) {
    this.createForm();
  }

  ngOnInit() {}

  ngOnDestroy() {}

  async login() {
    this.isLoading = true;
    const login$ = this.authenticationService.login(this.loginForm.value);
    const loadingOverlay = await this.loadingController.create({});
    const loading$ = from(loadingOverlay.present());
    forkJoin([login$, loading$])
      .pipe(
        map(([credentials, ...rest]) => credentials),
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
          loadingOverlay.dismiss();
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (credentials) => {
          this.router.navigate(['/']);
        },
        (error) => {
          log.error(error);
        }
      );
  }

  async loginNoredirect() {
    this.isLoading = true;
    const login$ = this.authenticationService.login(this.loginForm.value);
    const loadingOverlay = await this.loadingController.create({});
    const loading$ = from(loadingOverlay.present());
    return forkJoin([login$, loading$])
      .pipe(
        map(([credentials, ...rest]) => credentials),
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
          loadingOverlay.dismiss();
          return true;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (credentials) => {
          log.debug('login Correcto');
        },
        (error) => {
          log.error(error);
          return false;
        }
      );
  }

  get isWeb(): boolean {
    return !this.platform.is('cordova');
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, EmailValidator.isValid]],
      password: ['', [Validators.required, Validators.minLength(6), NoWhiteSpaceValidator.isValid]],
      remember: true,
    });
  }
}
