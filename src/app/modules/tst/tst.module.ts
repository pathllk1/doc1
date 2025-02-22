import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { TstRoutingModule } from './tst-routing.module';
import { TstComponent } from './tst.component';

@NgModule({
  declarations: [TstComponent],
  imports: [
    CommonModule,
    TstRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TstModule { }
