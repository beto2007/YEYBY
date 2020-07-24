import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { PendingOrdersComponent } from './pending-orders.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/pending-orders', pathMatch: 'full' },
      { path: 'pending-orders', component: PendingOrdersComponent, data: { title: extract('Órdenes en espera') } },
    ],
    ['admin', 'secretary']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class PendingOrdersRoutingModule {}
