import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { ReportComponent } from './report.component';

export const routes: Routes = [
    {
        path: '',
        component: ReportComponent,
    }
];
export const RoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
