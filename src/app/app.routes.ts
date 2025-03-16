import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';

import { UsersComponent } from './views/pages/users/users.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
    
      { path: 'users', component: UsersComponent }
    ],
  },
];
