import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';

import { DocsRoutingModule } from './docs-routing.module';
import { DocsComponent } from './docs.component';

@NgModule({
  declarations: [
    DocsComponent
  ],
  imports: [
    CommonModule,
    DocsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DocsModule { }
