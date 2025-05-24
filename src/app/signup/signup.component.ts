import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { WebService } from '../web.service';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

     public webService: WebService;
    
      constructor() {
        this.webService = WebService.getInstance();
      }
    
      formModel = {
    name: '',
    password: ''
  };

  loginSuccess: boolean | null = null;

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.webService.getUsers().subscribe(users => {
        const found = users.find(
          user =>
            user.name === this.formModel.name &&
            user.password === this.formModel.password
        );
        this.loginSuccess = !!found;
      });
    }
  }

}