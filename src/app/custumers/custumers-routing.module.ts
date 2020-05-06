import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { CustumersComponent } from './custumers.component';
import { DetailCustumersComponent } from './detail-custumers/detail-custumers.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/custumers', pathMatch: 'full' },
    { path: 'custumers', component: CustumersComponent, data: { title: extract('Clientes') } },
    { path: 'custumers/:id', component: DetailCustumersComponent, data: { title: extract('Detalle') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class CustumersRoutingModule {}
