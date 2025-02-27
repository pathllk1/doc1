import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NseRoutingModule } from './nse-routing.module';
import { NseComponent } from './nse.component';
import { SumPipe } from '../../shared/pipes/sum.pipe';
import { MfsComponent } from './mfs/mfs.component';

@NgModule({
  declarations: [
    NseComponent,
    SumPipe,
    MfsComponent
  ],
  imports: [
    CommonModule,
    NseRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NseModule { }
