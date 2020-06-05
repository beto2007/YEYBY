import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    ReportsRoutingModule,
  ],
  declarations: [ReportsComponent],
})
export class ReportsModule {}
