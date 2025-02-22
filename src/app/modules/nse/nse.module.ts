import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import { NseRoutingModule } from './nse-routing.module';
import { NseComponent } from './nse.component';
import { SumPipe } from '../../shared/pipes/sum.pipe';

@NgModule({
  declarations: [
    NseComponent,
    SumPipe
  ],
  imports: [
    CommonModule,
    NseRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NseModule { }
