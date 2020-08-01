import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { OrderDetailRoutingModule } from './order-detail-routing.module';
import { OrderDetailComponent } from './order-detail.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    OrderDetailRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [OrderDetailComponent],
  entryComponents: [],
  exports: [],
})
export class OrderDetailModule {}
