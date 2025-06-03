import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DogsComponent } from './dogs/dogs.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PetComponent } from './pet/pet.component';
import { BirdsComponent } from './birds/birds.component';
import { CatsComponent } from './cats/cats.component';
import { BasektComponent } from './basekt/basekt.component';
import { AllComponent } from './all/all.component';
import { ProfileComponent } from './profile/profile.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'dogs', component: DogsComponent },
    { path: 'cats', component: CatsComponent },
    { path: 'birds', component: BirdsComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'basket', component: BasektComponent },
    { path: 'all', component: AllComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'pet/:id', component: PetComponent },
    { path: '**', redirectTo: '' },
];
