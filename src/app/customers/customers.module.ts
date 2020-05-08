import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { AddCustomersComponent } from './add-customers/add-customers.component';
import { OptionsCustomersComponent } from './options-customers/options-customers.component';
import { DetailCustomersComponent } from './detail-customers/detail-customers.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    CustomersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [CustomersComponent, AddCustomersComponent, OptionsCustomersComponent, DetailCustomersComponent],
  entryComponents: [AddCustomersComponent, OptionsCustomersComponent, DetailCustomersComponent],
  exports: [AddCustomersComponent, OptionsCustomersComponent, DetailCustomersComponent],
})
export class CustomersModule {}
