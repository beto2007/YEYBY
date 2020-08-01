import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { OrderDetailComponent } from './order-detail.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/order-detail', pathMatch: 'full' },
      { path: 'order-detail/:id', component: OrderDetailComponent, data: { title: extract('Detalle de órden') } },
    ],
    ['admin', 'secretary']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class OrderDetailRoutingModule {}
