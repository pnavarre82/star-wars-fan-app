import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ListComponent } from './pages/list/list.component';
import { RoutesPaths } from './app-routing-paths.class';

const routes: Routes = [
  {
    path: RoutesPaths.Loging,
    component: LoginComponent
  },
  {
    path: RoutesPaths.List,
    component: ListComponent
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
