import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { DogsComponent } from './dogs/dogs.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'dogs', component: DogsComponent },
    { path: 'about', component: AboutComponent },
    { path: '**', redirectTo: '' },
];
