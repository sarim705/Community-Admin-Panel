import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';

import { UsersComponent } from './views/pages/users/users.component';
import { BannerComponent } from './views/pages/banner/banner.component';
import { CouponComponent } from './views/pages/coupon/coupon.component';
import { SubscriptionComponent } from './views/pages/subscription/subscription.component';
import { PostComponent } from './views/pages/news/post.component';




export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
    
      { path: 'users', component: UsersComponent },
      {path:'banner', component: BannerComponent },
      { path: 'coupon', component: CouponComponent },
      { path: 'subscription', component: SubscriptionComponent },
      { path: 'post', component: PostComponent },

      

      
    ],
  },
];
