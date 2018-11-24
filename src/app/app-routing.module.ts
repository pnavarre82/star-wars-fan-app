import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ListComponent } from './pages/list/list.component';
import { RoutesPaths } from './app-routing-paths.class';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: RoutesPaths.Loging,
    component: LoginComponent
  },
  {
    path: RoutesPaths.List,
    component: ListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
