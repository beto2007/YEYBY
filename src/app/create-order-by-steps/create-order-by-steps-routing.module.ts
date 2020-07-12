import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { CreateOrderByStepsComponent } from './create-order-by-steps.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/create-order', pathMatch: 'full' },
      { path: 'create-order', component: CreateOrderByStepsComponent, data: { title: extract('Crear órdenes') } },
    ],
    ['admin', 'secretary']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class CreateOrderByStepsRoutingModule {}
