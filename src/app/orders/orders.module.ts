import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    OrdersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [OrdersComponent],
  entryComponents: [],
  exports: [],
})
export class OrdersModule {}
