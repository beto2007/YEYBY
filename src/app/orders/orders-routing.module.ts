import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { OrdersComponent } from './orders.component';
//import { DetailDelivererComponent } from './detail-deliverer/detail-deliverer.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/orders', pathMatch: 'full' },
    { path: 'orders', component: OrdersComponent, data: { title: extract('Pedidos') } },
    //{ path: 'orders/:id', component: DetailDelivererComponent, data: { title: extract('Detalle') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class OrdersRoutingModule {}
