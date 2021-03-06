import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RoutingModule } from './program.routing';

import { ProgramComponent } from './program.component';
import { ProgramListComponent } from './program-list/program-list.component';
import { ProgramDetailComponent } from './program-detail/program-detail.component';

import { ProgramService } from './../../shared/services/program.service';
import { NgxSpinnerModule } from "ngx-spinner";
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  imports: [
    SharedModule,
    RoutingModule,
    NgxSpinnerModule,
    Ng2SearchPipeModule
  ],
  declarations: [
    ProgramComponent,
    ProgramListComponent,
    ProgramDetailComponent,
  ],
  providers: [
    ProgramService
  ]
})
export class ProgramModule { }
