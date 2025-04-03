import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserType } from '../../../services/auth.service';
import { AppStorage } from '../../../core/utilities/app-storage';

import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  baseUrl= environment.baseURL;

  userTypes: UserType[] = [];
  totalUsers: string = "0";
  loading: boolean = true;
  error: string | null = null;
  
  constructor(
    private authService: AuthService,
    private storage: AppStorage
  ) {}
  
  async ngOnInit(): Promise<void> {
    // Calling the method correctly with parentheses to execute it
    await this.getUserTypes();
    console.log("8520",this.userTypes);

  }

  async getUserTypes(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Making API call to get user types
      const data = await this.authService.getUserTypes();

      // Assuming 'data' has the required fields 'userTypes' and 'totalUsers'
      if (data && data.userTypes) {
        console.log("Fetched user data:", data);
        this.userTypes = data.userTypes;
        this.totalUsers = data.totalUsers;
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (error: any) {
      console.error('Error fetching user types:', error);
      this.error = error.message || 'An error occurred while fetching user types';
    } finally {
      this.loading = false;
    }
  }
 
  
  imageURl=environment.imageUrl
  getImageUrl(logoPath: string): string {
    if (!logoPath) return 'assets/images/default-user.png';
    if (logoPath.startsWith('http')) return logoPath;
    
    // Get base URL from environment (better approach than extracting from endpoints)
    const baseUrl = this.getBaseUrl();
    console.log("erghj",baseUrl);
    return `${baseUrl}/${logoPath}`;
  }
  
  private getBaseUrl(): string {
    // Extract base URL from existing endpoint
    const endpoint = this.storage.get('http://localhost:5000') || 'http://localhost:5000';
    if (endpoint) return endpoint;
    
    // Use the environment's baseURL if available
    return this.storage.get('environment')?.baseURL || '';
  }
  
  getUserTypeIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'buyer': 'fa-shopping-cart',
      'weaver': 'fa-industry',
      'trader': 'fa-exchange-alt',
      'valueaddition': 'fa-plus-circle',
      'broker': 'fa-handshake'
    };
    
    return icons[type.toLowerCase()] || 'fa-user';
  }
  
  getCardColor(index: number): string {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger'
    ];
    return colors[index % colors.length];
  }
  
  refreshData(): void {
    this.getUserTypes();
    // console.log(this.getUserTypes);
  }
}