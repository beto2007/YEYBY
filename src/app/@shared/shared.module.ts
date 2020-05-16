import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LoaderComponent } from './loader/loader.component';

@NgModule({
  imports: [IonicModule, CommonModule],
  declarations: [LoaderComponent],
  exports: [LoaderComponent],
  providers: [],
})
export class SharedModule {}
