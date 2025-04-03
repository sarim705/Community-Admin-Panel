import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Banner } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  bannerForm!: FormGroup; // Fixed: Definite assignment assertion
  selectedFile: File | null = null;
  banners: Banner[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  editMode: boolean = false;
  currentImageUrl: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalBanners: string = "0";

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.initForm(); // Ensure form is initialized
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  initForm(banner?: Banner): void {
    const formConfig: Record<string, any> = {
      title: [banner?.title || '', Validators.required],
      description: [banner?.description || '', Validators.required],
      redirectUrl: [banner?.redirectUrl || '', Validators.required],
      contact: [banner?.contact || '', Validators.required],
      fromDate: [
        banner?.fromDate ? this.formatDateForInput(banner.fromDate) : '', 
        Validators.required
      ],
      toDate: [
        banner?.toDate ? this.formatDateForInput(banner.toDate) : '', 
        Validators.required
      ],
      image: [null, Validators.required] // Fixed: Ensuring validation
    };

    if (banner) {
      formConfig['bannerId'] = [banner._id]; // Fixed: Explicitly adding dynamic fields
      formConfig['isActive'] = [banner.isActive];
    }

    this.bannerForm = this.fb.group(formConfig);
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  async loadBanners(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.authService.getAllBanners(this.currentPage, this.itemsPerPage);
      if (response) {
        this.banners = response.banners;
        this.totalPages = parseInt(response.totalPages);
        this.totalBanners = response.totalActiveBanners;
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openCreateModal(): void {
    this.editMode = false;
    this.initForm();
    this.selectedFile = null;
    this.currentImageUrl = null;
    this.showModal = true;
  }

  editBanner(banner: Banner): void {
    this.editMode = true;
    this.initForm(banner);
    this.selectedFile = null;
    this.currentImageUrl = this.authService.getImageUrl(banner.image);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.bannerForm.patchValue({ image: file });
      this.bannerForm.get('image')?.setErrors(null);
      
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      if (!this.editMode) {
        this.bannerForm.get('image')?.setErrors({ required: true });
      }
    }
  }

  onImageError(event: any): void {
    const placeholder = 'assets/images/placeholder-image.png';
    if (event.target.src !== placeholder) {
      event.target.src = 'hello';
    }
  }
  

  async onSubmit(): Promise<void> {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      swalHelper.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const formData = new FormData();
    if (this.editMode) {
      formData.append('bannerId', this.bannerForm.value.bannerId);
      formData.append('isActive', this.bannerForm.value.isActive);
    }
    
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
      let response;
      if (this.editMode) {
        response = await this.authService.updateBanner(formData);
      } else {
        response = await this.authService.createBanner(formData);
      }
      
      if (response) {
        swalHelper.showToast(
          `Banner ${this.editMode ? 'updated' : 'created'} successfully!`, 
          'success'
        );
        this.closeModal();
        this.loadBanners();
      }
    } catch (error) {
      swalHelper.showToast(`Failed to ${this.editMode ? 'update' : 'create'} banner`, 'error');
    }
  }

  async confirmDelete(bannerId: string): Promise<void> {
    const confirmed = await swalHelper.confirmation(
      'Delete Banner', 
      'Are you sure you want to delete this banner?',
      'warning'
    );
    
    if (confirmed) {
      try {
        const success = await this.authService.deleteBanner(bannerId);
        if (success) {
          swalHelper.showToast('Banner deleted successfully!', 'success');
          this.loadBanners();
        }
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadBanners();
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
