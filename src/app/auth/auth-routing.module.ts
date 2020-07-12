import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SessionGuard } from '@app/auth/session/session.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, data: { title: extract('Ingreso') }, canActivate: [SessionGuard] },
  { path: 'register', component: RegisterComponent, data: { title: extract('Registro') }, canActivate: [SessionGuard] },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { title: extract('Reiniciar contraseña') },
    canActivate: [SessionGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AuthRoutingModule {}
