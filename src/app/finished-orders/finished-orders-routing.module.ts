import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { FinishedOrdersComponent } from './finished-orders.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/finished-orders', pathMatch: 'full' },
      { path: 'finished-orders', component: FinishedOrdersComponent, data: { title: extract('Órdenes terminadas') } },
    ],
    ['admin', 'secretary']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class FinishedOrdersRoutingModule {}
