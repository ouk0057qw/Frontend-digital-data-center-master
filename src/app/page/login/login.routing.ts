import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { LoginComponent } from './login.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginComponent
    }
];
export const RoutingModule: ModuleWithProviders = RouterModule.forChild(routes);
