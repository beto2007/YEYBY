import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { CompaniesRoutingModule } from './companies-routing.module';
import { CompaniesComponent } from './companies.component';
import { AddCompanyComponent } from './add-company/add-company.component';
import { OptionsCompaniesComponent } from './options-companies/options-companies.component';

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
  ],
  declarations: [CompaniesComponent, AddCompanyComponent, OptionsCompaniesComponent],
  entryComponents: [AddCompanyComponent],
  exports: [AddCompanyComponent],
})
export class CompaniesModule {}
