import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/i18n';
import { CompaniesComponent } from './companies.component';
import { DetailCompanyComponent } from './detail-company/detail-company.component';
import { Shell } from '@app/shell/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/companies', pathMatch: 'full' },
    { path: 'companies', component: CompaniesComponent, data: { title: extract('Empresas') } },
    { path: 'companies/:id', component: DetailCompanyComponent, data: { title: extract('Detalle') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class CompaniesRoutingModule {}
