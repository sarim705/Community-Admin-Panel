import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CommonModule, DatePipe } from '@angular/common';

// Define Coupon interface
export interface Coupon {
  _id: string;
  title: string;
  couponName: string;
  description: string;
  image: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: string;
}

// Define Coupon Response interface
export interface CouponResponse {
  totalPages: string;
  page: string;
  limit: string;
  totalActiveCoupons: string;
  coupons: Coupon[];
}

@Component({
  selector: 'app-coupon',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})
export class CouponComponent implements OnInit {
  couponForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  coupons: Coupon[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalCoupons: string = "0";

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCoupons();
  }

  initForm(): void {
    this.couponForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      couponName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      expiryDate: ['', [Validators.required]],
      image: [null, [Validators.required]]
    });
  }

  async loadCoupons(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.authService.getAllCoupons(this.currentPage, this.itemsPerPage);
      if (response) {
        this.coupons = response.coupons;
        this.totalPages = parseInt(response.totalPages);
        this.totalCoupons = response.totalActiveCoupons;
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openCreateModal(): void {
    this.initForm();
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.couponForm.patchValue({ image: file });
      this.couponForm.get('image')?.setErrors(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.couponForm.get('image')?.setErrors({ required: true });
      this.imagePreviewUrl = null;
    }
  }

  onImageError(event: any): void {
    const placeholder = 'assets/images/placeholder-image.png';
    if (event.target.src !== placeholder) {
      event.target.src = placeholder;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      swalHelper.showToast('Please fill in all required fields', 'warning');
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
      const response = await this.authService.createCoupon(formData);
      
      if (response) {
        swalHelper.showToast('Coupon created successfully!', 'success');
        this.closeModal();
        this.loadCoupons();
      }
    } catch (error) {
      swalHelper.showToast('Failed to create coupon', 'error');
    }
  }

  async confirmDelete(couponId: string): Promise<void> {
    const confirmed = await swalHelper.confirmation(
      'Delete Coupon', 
      'Are you sure you want to delete this coupon?',
      'warning'
    );
    
    if (confirmed) {
      try {
        const success = await this.authService.deleteCoupon(couponId);
        if (success) {
          swalHelper.showToast('Coupon deleted successfully!', 'success');
          this.loadCoupons();
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadCoupons();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}