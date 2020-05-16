import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { CompaniesRoutingModule } from './companies-routing.module';
import { CompaniesComponent } from './companies.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { OptionsCompaniesComponent } from './options-companies/options-companies.component';
import { DetailCompanyComponent } from './detail-company/detail-company.component';
import { SortByCompanyComponent } from './sort-by-company/sort-by-company.component';
import { WorkDaysComponent } from './work-days/work-days.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    CompaniesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    CompaniesComponent,
    AddCompanyComponent,
    OptionsCompaniesComponent,
    DetailCompanyComponent,
    SortByCompanyComponent,
    WorkDaysComponent,
  ],
  entryComponents: [AddCompanyComponent, OptionsCompaniesComponent, DetailCompanyComponent],
  exports: [AddCompanyComponent, OptionsCompaniesComponent, DetailCompanyComponent],
})
export class CompaniesModule {}
