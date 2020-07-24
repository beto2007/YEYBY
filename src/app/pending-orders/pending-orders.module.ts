import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { PendingOrdersRoutingModule } from './pending-orders-routing.module';
import { PendingOrdersComponent } from './pending-orders.component';
import { CustomersModule } from '../customers/customers.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    PendingOrdersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CustomersModule,
  ],
  declarations: [PendingOrdersComponent],
})
export class PendingOrdersModule {}
