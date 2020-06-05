import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { Angulartics2Module } from 'angulartics2';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { AuthModule } from '@app/auth/auth.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    CoreModule,
    SharedModule,
    IonicModule,
    Angulartics2Module,
    ProfileRoutingModule,
    ReactiveFormsModule,
    AuthModule,
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
