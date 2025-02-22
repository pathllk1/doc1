import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TstComponent } from './tst.component';

const routes: Routes = [{ path: '', component: TstComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TstRoutingModule { }
