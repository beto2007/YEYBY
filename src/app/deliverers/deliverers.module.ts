import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { DeliverersRoutingModule } from './deliverers-routing.module';
import { DeliverersComponent } from './deliverers.component';
import { AddDelivererComponent } from './add-deliverer/add-deliverer.component';
import { OptionsDelivererComponent } from './options-deliverer/options-deliverer.component';
import { DetailDelivererComponent } from './detail-deliverer/detail-deliverer.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    DeliverersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    DeliverersComponent,
    AddDelivererComponent,
    OptionsDelivererComponent,
    DetailDelivererComponent,
    AddDelivererComponent,
    OptionsDelivererComponent,
    DetailDelivererComponent,
  ],
  entryComponents: [AddDelivererComponent, OptionsDelivererComponent, DetailDelivererComponent],
  exports: [AddDelivererComponent, OptionsDelivererComponent, DetailDelivererComponent],
})
export class DeliverersModule {}
