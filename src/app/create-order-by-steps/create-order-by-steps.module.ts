import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { CreateOrderByStepsRoutingModule } from './create-order-by-steps-routing.module';
import { CreateOrderByStepsComponent } from './create-order-by-steps.component';
import { CustomersModule } from '../customers/customers.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    CreateOrderByStepsRoutingModule,
    ReactiveFormsModule,
    CustomersModule,
  ],
  declarations: [CreateOrderByStepsComponent],
})
export class CreateOrderByStepsModule {}
