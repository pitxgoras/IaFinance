import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './components/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dse', 
    loadChildren: () => import('./pages/dse/dse.module').then(m => m.DseModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'pfse', 
    loadChildren: () => import('./pages/pfse/pfse.module').then(m => m.PfseModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'ioie', 
    loadChildren: () => import('./pages/ioie/ioie.module').then(m => m.IoieModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'eif', 
    loadChildren: () => import('./pages/eif/eif.module').then(m => m.EifModule),
    canActivate: [AuthGuard]
  },
  { 
    path: 'chat', 
    loadChildren: () => import('./pages/cfil/cfil.module').then(m => m.CfilModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }