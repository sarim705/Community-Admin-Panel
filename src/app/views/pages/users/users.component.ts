import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { PaginationModel } from '../../../core/utilities/pagination-model';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  searchQuery: string = '';
  pagination: PaginationModel | null = null;
  selectedUser: any = null;
  userDetailsModal: any;
  
  // Search debounce
  private searchSubject = new Subject<string>();
  
  // Current page and limit
  currentPage: number = 1;
  pageLimit: number = 10;

  constructor(private authService: AuthService) {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(500) // Wait for 500ms after the last event
    ).subscribe(() => {
      this.fetchUsers();
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
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
        
        // If response includes pagination data
        if (response.pagination) {
          this.pagination = response.pagination;
        } else {
          // Create pagination object if not provided
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
    this.currentPage = 1; // Reset to first page when searching
    this.searchSubject.next(this.searchQuery);
  }

  viewUserDetails(user: any): void {
    this.selectedUser = user;
    this.userDetailsModal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    this.userDetailsModal.show();
  }

  editUser(user: any): void {
    // Close modal if open
    if (this.userDetailsModal) {
      this.userDetailsModal.hide();
    }
    
    // You would typically navigate to an edit page or open an edit modal
    console.log('Edit user:', user);
    // Example: this.router.navigate(['/users/edit', user._id]);
    
    // For now, just show a message
    swalHelper.showToast('Edit user functionality not implemented yet', 'info');
  }

  async deleteUser(userId: string): Promise<void> {
    // Confirm before deletion
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
        this.fetchUsers(); // Refresh the list
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
    
    // Calculate range to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Adjust if we're near the start or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    // Create array of page numbers
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}