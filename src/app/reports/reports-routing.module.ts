import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { extract } from '@app/i18n';
import { ReportsComponent } from './reports.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes(
    [
      { path: '', redirectTo: '/reports', pathMatch: 'full' },
      { path: 'reports', component: ReportsComponent, data: { title: extract('Reportes') } },
    ],
    ['admin']
  ),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class ReportsRoutingModule {}
