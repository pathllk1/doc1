import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NseComponent } from './nse.component';
import { MfsComponent } from './mfs/mfs.component';

const routes: Routes = [
  { path: '', component: NseComponent },
  { path: 'mfs', component: MfsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NseRoutingModule { }
