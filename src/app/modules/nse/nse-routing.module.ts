import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NseComponent } from './nse.component';

const routes: Routes = [{ path: '', component: NseComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NseRoutingModule { }
