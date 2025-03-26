import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Add ReactiveFormsModule and CommonModule
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent {
  couponForm: FormGroup;
  selectedFile: File | null = null;
  isEditMode: boolean = false;
  couponId: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.couponForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      couponName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      expiryDate: ['', [Validators.required]],
      image: [null, [Validators.required]] // For file upload
    });
  }

  // Helper method to check if a field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.couponForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // Helper method to get error message for a field
  getErrorMessage(field: string): string {
    const control = this.couponForm.get(field);
    if (control?.errors?.['required']) {
      return 'This field is required';
    } else if (control?.errors?.['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }
    return '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.couponForm.patchValue({ image: file });
    }
  }

  async onSubmit() {
    if (this.couponForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.couponForm.markAllAsTouched();
      swalHelper.showToast('Please fill in all required fields correctly', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.couponForm.value.title);
    formData.append('couponName', this.couponForm.value.couponName);
    formData.append('description', this.couponForm.value.description);
    formData.append('expiryDate', this.couponForm.value.expiryDate);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    try {
      let response;
      if (this.isEditMode && this.couponId) {
        // Update coupon
        formData.append('couponId', this.couponId);
        response = await this.authService.updateCoupon(formData);
      } else {
        // Create coupon
        response = await this.authService.createCoupon(formData);
      }

      if (response) {
        swalHelper.showToast(`Coupon ${this.isEditMode ? 'updated' : 'created'} successfully!`, 'success');
        this.couponForm.reset();
        this.selectedFile = null;
        this.isEditMode = false;
        this.couponId = null;
      }
    } catch (error) {
      swalHelper.showToast(`Failed to ${this.isEditMode ? 'update' : 'create'} coupon`, 'error');
    }
  }

  onEdit(coupon: any) {
    this.isEditMode = true;
    this.couponId = coupon._id;
    this.couponForm.patchValue({
      title: coupon.title,
      couponName: coupon.couponName,
      description: coupon.description,
      expiryDate: coupon.expiryDate
    });
  }
}

