import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ListComponent } from './pages/list/list.component';
import { DetailViewComponent } from './pages/detail-view/detail-view.component';
import { RoutesPaths } from './app-routing-paths.class';
import { AuthGuard } from './guards/auth.guard';
import { SwapiFetcherService } from './services/swapi-fetcher/swapi-fetcher.service';

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

SwapiFetcherService.Resources.forEach(resource => {
  // inserted after login path
  routes.splice(1, 0, {
    path: `${resource}/:id`,
    component: DetailViewComponent,
    canActivate: [AuthGuard]
  });
});

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
