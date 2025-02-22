import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule) 
  },
  { 
    path: 'docs', 
    loadChildren: () => import('./modules/docs/docs.module').then(m => m.DocsModule) , canActivate: [AuthGuard]
  },
  { 
    path: 'nse', 
    loadChildren: () => import('./modules/nse/nse.module').then(m => m.NseModule) , canActivate: [AuthGuard]
  },
  { 
    path: 'auth', 
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'tst', 
    loadChildren: () => import('./modules/tst/tst.module').then(m => m.TstModule) , canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
