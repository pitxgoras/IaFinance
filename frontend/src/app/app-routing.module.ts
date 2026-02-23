import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CfilComponent } from './pages/cfil/cfil.component';  // ← CAMBIADO: ChatComponent → CfilComponent
import { DseComponent } from './pages/dse/dse.component';
import { PfseComponent } from './pages/pfse/pfse.component';
import { IoieComponent } from './pages/ioie/ioie.component';
import { EifComponent } from './pages/eif/eif.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'chat', component: CfilComponent },  // ← La ruta sigue siendo '/chat' pero usa CfilComponent
  { path: 'dse', component: DseComponent },
  { path: 'pfse', component: PfseComponent },
  { path: 'ioie', component: IoieComponent },
  { path: 'eif', component: EifComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }