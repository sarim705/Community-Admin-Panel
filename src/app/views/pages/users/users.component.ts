import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ReferralService1 } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
  users: any;
  loading: boolean = false;
  searchQuery: string = '';
  selectedUser: any = null;
  userDetailsModal: any;
  imageurl = environment.imageUrl;
  activeTab: string = 'profile';
  referralTab: string = 'given';
  referralsGiven: any[] = [];
  referralsReceived: any[] = [];
  referralLoading: boolean = false;
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  referralPayload = {
    page: 1,
    limit: 5
  };

  constructor(
    private authService: AuthService,
    private referralService: ReferralService1,
    private cdr: ChangeDetectorRef
  ) {
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
    setTimeout(() => {
      const modalElement = document.getElementById('userDetailsModal');
      if (modalElement) {
        this.userDetailsModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchUsers(): Promise<void> {
    this.loading = true;
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      const response = await this.authService.getUsers(requestData);
      if (response) {
        this.users = response;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchUsers();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchUsers();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'referrals' && this.selectedUser) {
      this.referralTab = 'given'; // Reset to 'given' tab
      this.referralsGiven = [];
      this.referralsReceived = [];
      this.referralPayload.page = 1;
      this.fetchReferrals();
    }
  }

  setReferralTab(tab: string): void {
    this.referralTab = tab;
    this.referralPayload.page = 1;
    this.fetchReferrals();
  }

  async fetchReferrals(): Promise<void> {
    if (!this.selectedUser?._id) {
      console.warn('No user ID available for fetching referrals');
      return;
    }
    
    this.referralLoading = true;
    try {
      let response;
      if (this.referralTab === 'given') {
        response = await this.referralService.getReferralsGiven(this.selectedUser._id, this.referralPayload);
        console.log('Referrals Given API Response:', response);
        this.referralsGiven = (response?.data && Array.isArray(response.data)) ? response.data : [];
      } else {
        response = await this.referralService.getReferralsReceived(this.selectedUser._id, this.referralPayload);
        console.log('Referrals Received API Response:', response);
        this.referralsReceived = (response?.data && Array.isArray(response.data)) ? response.data : [];
      }
      console.log('Referrals Given:', this.referralsGiven);
      console.log('Referrals Received:', this.referralsReceived);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching referrals:', error);
      swalHelper.showToast('Failed to fetch referrals', 'error');
      this.referralsGiven = [];
      this.referralsReceived = [];
      this.cdr.detectChanges();
    } finally {
      this.referralLoading = false;
      this.cdr.detectChanges();
    }
  }

  onGivenReferralPageChange(page: number): void {
    this.referralPayload.page = page;
    this.fetchReferrals();
  }

  onReceivedReferralPageChange(page: number): void {
    this.referralPayload.page = page;
    this.fetchReferrals();
  }

  viewUserDetails(user: any): void {
    this.selectedUser = user;
    this.activeTab = 'profile';
    this.referralTab = 'given';
    this.referralsGiven = [];
    this.referralsReceived = [];
    
    if (this.userDetailsModal) {
      this.userDetailsModal.show();
    } else {
      try {
        const modalElement = document.getElementById('userDetailsModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.userDetailsModal = modalInstance;
          modalInstance.show();
        } else {
          $('#userDetailsModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#userDetailsModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.userDetailsModal) {
      this.userDetailsModal.hide();
    } else {
      $('#userDetailsModal').modal('hide');
    }
  }

  async toggleUserStatus(user: any): Promise<void> {
    try {
      this.loading = true;
      const updatedStatus = !user.acc_active;
      await this.authService.updateUserStatus(user._id, updatedStatus);
      user.acc_active = updatedStatus;
      swalHelper.showToast(`User status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      swalHelper.showToast('Failed to update user status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete User',
        'Are you sure you want to delete this user? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        await this.authService.deleteUser(userId);
        swalHelper.showToast('User deleted successfully', 'success');
        this.fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      swalHelper.showToast('Failed to delete user', 'error');
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  exportToPDF(): void {
    this.loading = true;
    swalHelper.showToast('Generating PDF, please wait...', 'info');
    
    const currentPage = this.payload.page;
    const currentLimit = this.payload.limit;
    const currentSearch = this.payload.search;
    
    const generatePDF = async (allUsers: any[]): Promise<void> => {
      try {
        const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        
        pdf.setFontSize(18);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Member List Report', margin, margin + 10);
        
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 18);
        if (currentSearch) {
          pdf.text(`Search query: "${currentSearch}"`, margin, margin + 24);
        }
        
        interface TableColumn {
          header: string;
          dataKey: string;
          width: number;
        }
        
        const columns: TableColumn[] = [
          { header: 'Name', dataKey: 'name', width: 0.25 },
          { header: 'Business', dataKey: 'business', width: 0.25 },
          { header: 'Mobile', dataKey: 'mobile', width: 0.15 },
          { header: 'Email', dataKey: 'email', width: 0.20 },
          { header: 'Role', dataKey: 'role', width: 0.15 }
        ];
        
        const tableTop = margin + 30;
        const tableWidth = pageWidth - (margin * 2);
        const rowHeight = 12;
        
        pdf.setFillColor(236, 240, 241);
        pdf.rect(margin, tableTop, tableWidth, rowHeight, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);
        
        let xPos = margin;
        columns.forEach(column => {
          const colWidth = tableWidth * column.width;
          pdf.text(column.header, xPos + 3, tableTop + 8);
          xPos += colWidth;
        });
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50, 50, 50);
        
        let yPos = tableTop + rowHeight;
        let pageNo = 1;
        
        for (let i = 0; i < allUsers.length; i++) {
          const user = allUsers[i];
          
          if (yPos > pageHeight - margin) {
            pdf.addPage();
            pageNo++;
            
            pdf.setFillColor(236, 240, 241);
            pdf.rect(margin, margin, tableWidth, rowHeight, 'F');
            
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(44, 62, 80);
            
            xPos = margin;
            columns.forEach(column => {
              const colWidth = tableWidth * column.width;
              pdf.text(column.header, xPos + 3, margin + 8);
              xPos += colWidth;
            });
            
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(50, 50, 50);
            
            yPos = margin + rowHeight;
          }
          
          if (i % 2 === 1) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPos, tableWidth, rowHeight, 'F');
          }
          
          interface UserData {
            name: string;
            business: string;
            mobile: string;
            email: string;
            role: string;
            [key: string]: string;
          }
          
          const userData: UserData = {
            name: user.name || 'Unknown User',
            business: user.business && user.business.length > 0 ? user.business[0].business_name : 'N/A',
            mobile: user.mobile_number || 'N/A',
            email: user.email || 'N/A',
            role: user.meeting_role || 'N/A'
          };
          
          xPos = margin;
          columns.forEach(column => {
            const colWidth = tableWidth * column.width;
            let text = userData[column.dataKey] || '';
            if (text.length > 25) {
              text = text.substring(0, 22) + '...';
            }
            pdf.text(text, xPos + 3, yPos + 8);
            xPos += colWidth;
          });
          
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, yPos + rowHeight, margin + tableWidth, yPos + rowHeight);
          
          yPos += rowHeight;
        }
        
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);
        
        const totalText = `Total Members: ${allUsers.length}`;
        pdf.text(totalText, margin, pageHeight - 10);
        
        for (let p = 1; p <= pageNo; p++) {
          pdf.setPage(p);
          pdf.text(`Page ${p} of ${pageNo}`, pageWidth - 30, pageHeight - 10);
        }
        
        pdf.save('members_list.pdf');
        swalHelper.showToast('PDF exported successfully', 'success');
      } catch (error) {
        console.error('Error generating PDF:', error);
        swalHelper.showToast('Failed to generate PDF', 'error');
      } finally {
        this.loading = false;
      }
    };
    
    if (this.users.totalDocs <= this.users.docs.length) {
      generatePDF(this.users.docs);
    } else {
      const fetchAllUsers = async (): Promise<void> => {
        try {
          const requestData = {
            page: 1,
            limit: this.users.totalDocs,
            search: currentSearch
          };
          const response = await this.authService.getUsers(requestData);
          if (response && response.docs) {
            generatePDF(response.docs);
          } else {
            throw new Error('Failed to fetch all users');
          }
        } catch (error) {
          console.error('Error fetching all users for PDF:', error);
          swalHelper.showToast('Failed to fetch all users for PDF', 'error');
          this.loading = false;
        }
      };
      fetchAllUsers();
    }
  }

  exportToExcel(): void {
    this.loading = true;
    swalHelper.showToast('Generating Excel, please wait...', 'info');
    
    const currentPage = this.payload.page;
    const currentLimit = this.payload.limit;
    const currentSearch = this.payload.search;
    
    const generateExcel = async (allUsers: any[]): Promise<void> => {
      try {
        const userData = allUsers.map(user => ({
          Name: user.name || 'Unknown User',
          Business: user.business && user.business.length > 0 ? user.business[0].business_name : 'N/A',
          Mobile: user.mobile_number || 'N/A',
          Email: user.email || 'N/A',
          Role: user.meeting_role || 'N/A'
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(userData);
        
        // Set column widths
        const columnWidths = [
          { wch: 30 }, // Name
          { wch: 40 }, // Business
          { wch: 20 }, // Mobile
          { wch: 30 }, // Email
          { wch: 20 }  // Role
        ];
        worksheet['!cols'] = columnWidths;
        
        // Add header row styling
        const headers = ['Name', 'Business', 'Mobile', 'Email', 'Role'];
        headers.forEach((header, index) => {
          const cell = String.fromCharCode(65 + index) + '1';
          if (worksheet[cell]) {
            worksheet[cell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'ECEFF1' } }
            };
          }
        });
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
        
        // Add metadata sheet
        const metadata = [
          ['Report', 'Member List Report'],
          ['Generated on', new Date().toLocaleString()],
          ['Search query', currentSearch || 'None'],
          ['Total Members', allUsers.length.toString()]
        ];
        const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
        metadataSheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
        
        XLSX.writeFile(workbook, 'members_list.xlsx');
        swalHelper.showToast('Excel exported successfully', 'success');
      } catch (error) {
        console.error('Error generating Excel:', error);
        swalHelper.showToast('Failed to generate Excel', 'error');
      } finally {
        this.loading = false;
      }
    };
    
    if (this.users.totalDocs <= this.users.docs.length) {
      generateExcel(this.users.docs);
    } else {
      const fetchAllUsers = async (): Promise<void> => {
        try {
          const requestData = {
            page: 1,
            limit: this.users.totalDocs,
            search: currentSearch
          };
          const response = await this.authService.getUsers(requestData);
          if (response && response.docs) {
            generateExcel(response.docs);
          } else {
            throw new Error('Failed to fetch all users');
          }
        } catch (error) {
          console.error('Error fetching all users for Excel:', error);
          swalHelper.showToast('Failed to fetch all users for Excel', 'error');
          this.loading = false;
        }
      };
      fetchAllUsers();
    }
  }
}