import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';
import { ShellComponent } from './shared/shell.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BudgetsComponent } from './features/budgets/budgets.component';
import { ExpendituresComponent } from './features/expenditures/expenditures.component';
import { ReportsComponent } from './features/departments/reports.component';
import { AlertsComponent } from './features/alerts/alerts.component';
import { AdminPanelComponent } from './features/admin/admin-panel.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'event-register',
        loadComponent: () => import('./features/home/event-register.component').then(m => m.EventRegisterComponent),
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'budgets',
        component: BudgetsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'expenditures',
        component: ExpendituresComponent,
        canActivate: [authGuard],
      },
      {
        path: 'reports',
        component: ReportsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        canActivate: [authGuard],
      },
      {
        path: 'blog',
        loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent),
      },
      {
        path: 'admin',
        component: AdminPanelComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
