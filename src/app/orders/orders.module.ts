import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { DetailOrderComponent } from './detail-order/detail-order.component';
import { SortByOrderComponent } from './sort-by-order/sort-by-order.component';
import { OptionsOrderComponent } from './options-order/options-order.component';

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
    FormsModule,
  ],
  declarations: [OrdersComponent, DetailOrderComponent, SortByOrderComponent, OptionsOrderComponent],
  entryComponents: [],
  exports: [],
})
export class OrdersModule {}
