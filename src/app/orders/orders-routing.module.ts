import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { OrdersComponent } from './orders.component';
import { DetailOrderComponent } from './detail-order/detail-order.component';
import { DetailOrderSpecialComponent } from './detail-order-special/detail-order-special.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/orders', pathMatch: 'full' },
      { path: 'orders', component: OrdersComponent, data: { title: extract('Pedidos') } },
      { path: 'orders/type/:type', component: OrdersComponent, data: { title: extract('Pedidos') } },
      { path: 'orders/:id', component: DetailOrderComponent, data: { title: extract('Detalle') } },
      { path: 'special-orders/:id', component: DetailOrderSpecialComponent, data: { title: extract('Detalle') } },
    ],
    ['admin']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class OrdersRoutingModule {}
