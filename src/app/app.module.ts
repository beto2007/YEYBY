import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { Angulartics2Module } from 'angulartics2';
import { environment } from '@env/environment';
import { CoreModule } from '@core';
import { SharedModule } from '@shared';
import { AuthModule } from '@app/auth';
import { HomeModule } from './home/home.module';
import { CompaniesModule } from './companies/companies.module';
import { CustomersModule } from './customers/customers.module';
import { DeliverersModule } from './deliverers/deliverers.module';
import { ProfileModule } from './user/profile/profile.module';
import { ReportsModule } from './reports/reports.module';
import { ShellModule } from './shell/shell.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { firebaseConfig } from '../environments/firebaseConfig';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { CreateOrderByStepsModule } from './create-order-by-steps/create-order-by-steps.module';
import { FinishedOrdersModule } from './finished-orders/finished-orders.module';
import { PendingOrdersModule } from './pending-orders/pending-orders.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { YeybyUsersModule } from './yeyby-users/yeyby-users.module';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    CoreModule,
    SharedModule,
    ShellModule,
    HomeModule,
    CompaniesModule,
    CustomersModule,
    DeliverersModule,
    ProfileModule,
    ReportsModule,
    CreateOrderByStepsModule,
    FinishedOrdersModule,
    PendingOrdersModule,
    OrderDetailModule,
    YeybyUsersModule,
    AuthModule,
    Angulartics2Module.forRoot(),
    AppRoutingModule, // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
