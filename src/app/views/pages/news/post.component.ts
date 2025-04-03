import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CommonModule, DatePipe } from '@angular/common';

interface Post {
  _id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  venue?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostResponse {
  totalPages: string;
  page: string;
  limit: string;
  totalPosts: string;
  posts: Post[];
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  postForm!: FormGroup;
  selectedFile: File | null = null;
  posts: Post[] = [];
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  currentImageUrl: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalPosts: string = "0";

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  initForm(post?: Post): void {
    const formConfig: Record<string, any> = {
      type: [post?.type || '', Validators.required],
      title: [post?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [post?.description || '', [Validators.required, Validators.minLength(10)]],
      image: [null]
    };

    // Add event-specific fields
    formConfig['startDate'] = [post?.startDate ? this.formatDateForInput(post.startDate) : ''];
    formConfig['endDate'] = [post?.endDate ? this.formatDateForInput(post.endDate) : ''];
    formConfig['startTime'] = [post?.startTime || ''];
    formConfig['endTime'] = [post?.endTime || ''];
    formConfig['location'] = [post?.location || ''];
    formConfig['venue'] = [post?.venue || ''];
    formConfig['mapUrl'] = [post?.mapUrl || ''];

    // For edit mode, add the post ID
    if (post) {
      formConfig['postId'] = [post._id];
    }

    this.postForm = this.fb.group(formConfig);

    // Set conditional validators based on post type
    this.postForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'event') {
        this.postForm.get('startDate')?.setValidators([Validators.required]);
        this.postForm.get('endDate')?.setValidators([Validators.required]);
        this.postForm.get('location')?.setValidators([Validators.required]);
        this.postForm.get('venue')?.setValidators([Validators.required]);
        this.postForm.get('mapUrl')?.setValidators([Validators.required]);
      } else {
        this.postForm.get('startDate')?.clearValidators();
        this.postForm.get('endDate')?.clearValidators();
        this.postForm.get('location')?.clearValidators();
        this.postForm.get('venue')?.clearValidators();
        this.postForm.get('mapUrl')?.clearValidators();
      }
      this.postForm.get('startDate')?.updateValueAndValidity();
      this.postForm.get('endDate')?.updateValueAndValidity();
      this.postForm.get('location')?.updateValueAndValidity();
      this.postForm.get('venue')?.updateValueAndValidity();
      this.postForm.get('mapUrl')?.updateValueAndValidity();
    });

    // Set image validation
    if (!post) {
      this.postForm.get('image')?.setValidators([Validators.required]);
    }
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  async loadPosts(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.authService.getAllPosts(this.currentPage, this.itemsPerPage);
      if (response) {
        this.posts = response.posts;
        this.totalPages = parseInt(response.totalPages);
        this.totalPosts = response.totalPosts;
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      swalHelper.showToast('Failed to load posts', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.initForm();
    this.selectedFile = null;
    this.currentImageUrl = null;
    this.showModal = true;
  }

  editPost(post: Post): void {
    this.isEditMode = true;
    this.initForm(post);
    this.selectedFile = null;
    this.currentImageUrl = this.authService.getImageUrl(post.image);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onTypeChange(): void {
    // Reset event-specific fields when type changes
    if (this.postForm.get('type')?.value !== 'event') {
      this.postForm.patchValue({
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        venue: '',
        mapUrl: ''
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        swalHelper.showToast('Image file size must be less than 5MB', 'error');
        return;
      }
      
      this.selectedFile = file;
      this.postForm.patchValue({ image: file });
      this.postForm.get('image')?.setErrors(null);
      
      // Preview the selected image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      if (!this.isEditMode) {
        this.postForm.get('image')?.setErrors({ required: true });
      }
    }
  }

  onImageError(event: any): void {
    const placeholder = 'assets/images/placeholder-image.png';
    if (event.target.src !== placeholder) {
      event.target.src = placeholder;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'news':
        return 'badge bg-primary';
      case 'event':
        return 'badge bg-success';
      case 'announcement':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      swalHelper.showToast('Please fill in all required fields', 'warning');
      return;
    }

    const formData = new FormData();
    if (this.isEditMode) {
      formData.append('postId', this.postForm.value.postId);
    }
    
    // Get current user
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser._id) {
      swalHelper.showToast('User not authenticated', 'error');
      return;
    }
    
    // Append common fields
    formData.append('type', this.postForm.value.type);
    formData.append('title', this.postForm.value.title);
    formData.append('description', this.postForm.value.description);
    formData.append('userId', currentUser._id);
    
    // Append event-specific fields if type is event
    if (this.postForm.value.type === 'event') {
      formData.append('startDate', this.postForm.value.startDate);
      formData.append('endDate', this.postForm.value.endDate);
      formData.append('startTime', this.postForm.value.startTime || '');
      formData.append('endTime', this.postForm.value.endTime || '');
      formData.append('location', this.postForm.value.location);
      formData.append('venue', this.postForm.value.venue);
      formData.append('mapUrl', this.postForm.value.mapUrl);
    }
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    try {
      let response;
      if (this.isEditMode) {
        response = await this.authService.updatePost(formData);
      } else {
        response = await this.authService.createPost(formData);
      }
      
      if (response) {
        swalHelper.showToast(
          `Post ${this.isEditMode ? 'updated' : 'created'} successfully!`, 
          'success'
        );
        this.closeModal();
        this.loadPosts();
      }
    } catch (error) {
      swalHelper.showToast(`Failed to ${this.isEditMode ? 'update' : 'create'} post`, 'error');
    }
  }

  async confirmDelete(postId: string): Promise<void> {
    const confirmed = await swalHelper.confirmation(
      'Delete Post', 
      'Are you sure you want to delete this post?',
      'warning'
    );
    
    if (confirmed) {
      try {
        const success = await this.authService.deletePost(postId);
        if (success) {
          swalHelper.showToast('Post deleted successfully!', 'success');
          this.loadPosts();
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        swalHelper.showToast('Failed to delete post', 'error');
      }
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadPosts();
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