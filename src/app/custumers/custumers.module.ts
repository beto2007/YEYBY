import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { CustumersRoutingModule } from './custumers-routing.module';
import { CustumersComponent } from './custumers.component';
import { AddCustumersComponent } from './add-custumers/add-custumers.component';
import { OptionsCustumersComponent } from './options-custumers/options-custumers.component';
import { DetailCustumersComponent } from './detail-custumers/detail-custumers.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    CustumersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [CustumersComponent, AddCustumersComponent, OptionsCustumersComponent, DetailCustumersComponent],
  entryComponents: [AddCustumersComponent, OptionsCustumersComponent, DetailCustumersComponent],
  exports: [AddCustumersComponent, OptionsCustumersComponent, DetailCustumersComponent],
})
export class CustumersModule {}
