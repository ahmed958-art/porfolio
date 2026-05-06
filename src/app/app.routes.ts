import { Routes } from '@angular/router';
import { Home } from './home/home';
import { MainLayout } from './layout/mainlayout';
import { ServicesPage } from './pages/services/services';
import { ContactPage } from './pages/contact/contact';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'services', component: ServicesPage },
      { path: 'contact', component: ContactPage },
    ],
  },
  { path: '**', redirectTo: '' },
];
