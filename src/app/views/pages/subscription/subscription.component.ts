import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  subscriptionForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService
  ) {
    this.subscriptionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      duration: ['', Validators.required],
      type: ['monthly', Validators.required],
      features: [''],
      image: [null]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.subscriptionForm.patchValue({ image: file });
    }
  }

  async onSubmit() {
    if (this.subscriptionForm.invalid) {
      swalHelper.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.subscriptionForm.value.name);
    formData.append('description', this.subscriptionForm.value.description);
    formData.append('amount', this.subscriptionForm.value.amount);
    formData.append('duration', this.subscriptionForm.value.duration);
    formData.append('type', this.subscriptionForm.value.type);
    formData.append('features', this.subscriptionForm.value.features);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    try {
      const response = await this.authService.createSubscription(formData);
      if (response) {
        swalHelper.showToast('Subscription created successfully!', 'success');
        this.subscriptionForm.reset();
        this.selectedFile = null;
      }
    } catch (error) {
      swalHelper.showToast('Failed to create subscription', 'error');
    }
  }
}