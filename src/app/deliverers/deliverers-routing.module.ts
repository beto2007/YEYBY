import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { DeliverersComponent } from './deliverers.component';
import { DetailDelivererComponent } from './detail-deliverer/detail-deliverer.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/deliverers', pathMatch: 'full' },
      { path: 'deliverers', component: DeliverersComponent, data: { title: extract('Repartidores') } },
      { path: 'deliverers/orders/:mode', component: DeliverersComponent, data: { title: extract('Órdenes') } },
      { path: 'deliverers/:id', component: DetailDelivererComponent, data: { title: extract('Detalle') } },
    ],
    ['admin']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DeliverersRoutingModule {}
