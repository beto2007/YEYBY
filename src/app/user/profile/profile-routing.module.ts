import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { ProfileComponent } from './profile.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/profile', pathMatch: 'full' },
    { path: 'profile', component: ProfileComponent, data: { title: extract('Profile') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class ProfileRoutingModule {}
