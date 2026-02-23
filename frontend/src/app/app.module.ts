import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';  // ← AHORA SÍ FUNCIONA

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CfilComponent } from './pages/cfil/cfil.component';
import { DseComponent } from './pages/dse/dse.component';
import { PfseComponent } from './pages/pfse/pfse.component';
import { IoieComponent } from './pages/ioie/ioie.component';
import { EifComponent } from './pages/eif/eif.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    CfilComponent,
    DseComponent,
    PfseComponent,
    IoieComponent,
    EifComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule  // ← AGREGADO
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // ← AGREGADO
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }