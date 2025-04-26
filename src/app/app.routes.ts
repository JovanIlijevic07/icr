import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { FlightComponent } from './flight/flight.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'flight/:id', component: FlightComponent },
    //kad stavis dve zvezdice znaci bilo sta sto nije navedeno ide redirekt na ''
    { path: '**', redirectTo: '' },
];
