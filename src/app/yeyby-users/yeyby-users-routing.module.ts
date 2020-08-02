import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { YeybyUsersComponent } from './yeyby-users.component';
import { DetailYeybyUsersComponent } from './detail-yeyby-users/detail-yeyby-users.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/yeyby-users', pathMatch: 'full' },
      { path: 'yeyby-users', component: YeybyUsersComponent, data: { title: extract('Usuarios Yeyby') } },
      { path: 'yeyby-users/:id', component: DetailYeybyUsersComponent, data: { title: extract('Detalle') } },
    ],
    ['admin']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class YeybyUsersRoutingModule {}
