import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { YeybyUsersRoutingModule } from './yeyby-users-routing.module';
import { YeybyUsersComponent } from './yeyby-users.component';
import { AddYeybyUsersComponent } from './add-yeyby-users/add-yeyby-users.component';
import { OptionsYeybyUsersComponent } from './options-yeyby-users/options-yeyby-users.component';
import { DetailYeybyUsersComponent } from './detail-yeyby-users/detail-yeyby-users.component';
import { SortByYeybyUserComponent } from './sort-by-yeyby-user/sort-by-yeyby-user.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    YeybyUsersRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    YeybyUsersComponent,
    AddYeybyUsersComponent,
    OptionsYeybyUsersComponent,
    DetailYeybyUsersComponent,
    SortByYeybyUserComponent,
  ],
  entryComponents: [AddYeybyUsersComponent, OptionsYeybyUsersComponent, DetailYeybyUsersComponent],
  exports: [AddYeybyUsersComponent, OptionsYeybyUsersComponent, DetailYeybyUsersComponent],
})
export class YeybyUsersModule {}
