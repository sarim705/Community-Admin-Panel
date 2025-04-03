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
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      duration: ['', Validators.required],
      type: ['monthly', Validators.required],
      features: ['', Validators.required],
      image: [null, Validators.required]
    });
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.subscriptionForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(field: string): string {
    const control = this.subscriptionForm.get(field);
    if (control?.errors?.['required']) {
      return 'This field is required';
    } else if (control?.errors?.['min']) {
      return 'Amount must be non-negative';
    }
    return '';
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
      // Mark all fields as touched to display validation errors
      this.subscriptionForm.markAllAsTouched();
      swalHelper.showToast('Please fill in all required fields correctly', 'warning');
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