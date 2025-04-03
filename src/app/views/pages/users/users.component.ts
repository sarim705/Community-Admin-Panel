import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { PaginationModel } from '../../../core/utilities/pagination-model';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  loading: boolean = false;
  searchQuery: string = '';
  pagination: PaginationModel | null = null;
  selectedUser: any = null;
  userDetailsModal: any;
  imageurl = environment.imageUrl;
  
  private searchSubject = new Subject<string>();
  currentPage: number = 1;
  pageLimit: number = 10;

  constructor(private authService: AuthService) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchUsers();
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modals
    const modalElement = document.getElementById('userDetailsModal');
    if (modalElement) {
      this.userDetailsModal = new bootstrap.Modal(modalElement);
    }
  }

  async fetchUsers(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.currentPage,
        limit: this.pageLimit,
        search: this.searchQuery || ''
      };
      
      const response = await this.authService.getUsers(requestData);
      
      if (response && response.users) {
        this.users = response.users;
        
        if (response.pagination) {
          this.pagination = response.pagination;
        } else {
          this.pagination = {
            docs: this.users,
            totalDocs: this.users.length,
            limit: this.pageLimit,
            totalPages: Math.ceil(this.users.length / this.pageLimit),
            page: this.currentPage,
            pagingCounter: (this.currentPage - 1) * this.pageLimit + 1,
            hasPrevPage: this.currentPage > 1,
            hasNextPage: this.currentPage < Math.ceil(this.users.length / this.pageLimit),
            prevPage: this.currentPage > 1 ? this.currentPage - 1 : null,
            nextPage: this.currentPage < Math.ceil(this.users.length / this.pageLimit) ? this.currentPage + 1 : null
          };
        }
      } else {
        this.users = [];
        this.pagination = null;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
      this.users = [];
      this.pagination = null;
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.searchSubject.next(this.searchQuery);
  }

  viewUserDetails(user: any): void {
    this.selectedUser = user;
    if (this.userDetailsModal) {
      this.userDetailsModal.show();
    } else {
      $('#userDetailsModal').modal('show');
    }
  }
  
  closeModal(): void {
    if (this.userDetailsModal) {
      this.userDetailsModal.hide();
    } else {
      $('#userDetailsModal').modal('hide');
    }
  }

  editUser(user: any): void {
    this.closeModal();
    swalHelper.showToast('Edit user functionality not implemented yet', 'info');
  }

  async deleteUser(userId: string): Promise<void> {
    const confirmed = await swalHelper.confirmation(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      'warning'
    );
    
    if (confirmed) {
      this.loading = true;
      
      try {
        await this.authService.deleteUser(userId);
        swalHelper.showToast('User deleted successfully', 'success');
        this.fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        swalHelper.showToast('Failed to delete user', 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  goToPage(page: number | null): void {
    if (page !== null && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchUsers();
    }
  }

  getPages(): number[] {
    if (!this.pagination) return [];
    
    const currentPage = this.pagination.page;
    const totalPages = this.pagination.totalPages;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}