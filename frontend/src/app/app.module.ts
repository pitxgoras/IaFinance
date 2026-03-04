import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Módulos
import { DseModule } from './pages/dse/dse.module';
import { PfseModule } from './pages/pfse/pfse.module';
import { IoieModule } from './pages/ioie/ioie.module';
import { EifModule } from './pages/eif/eif.module';
import { CfilModule } from './pages/cfil/cfil.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DseModule,
    PfseModule,
    IoieModule,
    EifModule,
    CfilModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }