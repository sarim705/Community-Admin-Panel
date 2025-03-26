import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf, ngFor, etc.

@Component({
  selector: 'app-banner',
  standalone: true, // Mark as standalone
  imports: [ReactiveFormsModule, CommonModule], // Add ReactiveFormsModule and CommonModule here
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent {
  bannerForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.bannerForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      redirectUrl: [''],
      contact: [''],
      fromDate: [''],
      toDate: [''],
      image: [null] // For file upload
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.bannerForm.patchValue({ image: file });
    }
  }

  async onSubmit() {
    if (this.bannerForm.invalid) {
      swalHelper.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.bannerForm.value.title);
    formData.append('description', this.bannerForm.value.description);
    formData.append('redirectUrl', this.bannerForm.value.redirectUrl);
    formData.append('contact', this.bannerForm.value.contact);
    formData.append('fromDate', this.bannerForm.value.fromDate);
    formData.append('toDate', this.bannerForm.value.toDate);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    try {
      const response = await this.authService.createBanner(formData);
      if (response) {
        swalHelper.showToast('Banner created successfully!', 'success');
        this.bannerForm.reset();
        this.selectedFile = null;
      }
    } catch (error) {
      swalHelper.showToast('Failed to create banner', 'error');
    }
  }
}