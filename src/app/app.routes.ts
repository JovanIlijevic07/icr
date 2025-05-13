import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { FlightComponent } from './flight/flight.component';
import { ListComponent } from './list/list.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'list', component: ListComponent },
    { path: 'flight/:id', component: FlightComponent },
    //kad stavis dve zvezdice znaci bilo sta sto nije navedeno ide redirekt na ''
    { path: '**', redirectTo: '' },
];
