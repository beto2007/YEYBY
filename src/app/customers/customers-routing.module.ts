import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { CustomersComponent } from './customers.component';
import { DetailCustomersComponent } from './detail-customers/detail-customers.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/customers', pathMatch: 'full' },
    { path: 'customers', component: CustomersComponent, data: { title: extract('Clientes') } },
    { path: 'customers/:id', component: DetailCustomersComponent, data: { title: extract('Detalle') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class CustomersRoutingModule {}
