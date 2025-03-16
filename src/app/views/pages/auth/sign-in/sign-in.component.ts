import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  constructor(private authService: AuthService) {
    document.body.style.backgroundColor = '#1cbb8c';
  }

  ngOnInit(): void {}

  isPassword: boolean = true; 
  emailId = 'info@itfuturz.com';

  
  loginForm = new FormGroup({
    emailId: new FormControl('', [
      Validators.required, 
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6), 
    ]),
  });

  isLoading: boolean = false;

  // Submit function
  onSubmit = async () => {
    this.isLoading = true;
    if (this.loginForm.valid) {
      try {
        const response = await this.authService.signIn(this.loginForm.value);
        this.isLoading = false;
        if (response) {
          window.location.href ='/dashboard';
        }
      } catch (error) {
        console.error('Sign-In failed', error);
        this.isLoading = false;
      }
    } else {
      console.error('Form is invalid');
      this.isLoading = false;
    }
  };
}
