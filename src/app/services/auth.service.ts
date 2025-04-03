import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { environment } from 'src/env/env.local';

// Define interfaces for user types response
export interface UserType {
  _id: string;
  type: string;
  name: string;
  logo: string;
  description: string;
  userCount: string;
}

export interface UserTypesResponse {
  userTypes: UserType[];
  totalUsers: string;
}
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
  // Include any other properties you need from either definition
  discount?: number;  // Make optional with ? if not always present
  code?: string;      // Make optional with ? if not always present
}

export interface CouponResponse {
  totalPages: string;
  page: string;
  limit: string;
  totalActiveCoupons: string;
  coupons: Coupon[];
}


// Define Banner interface
export interface Banner {
  _id: string;
  title: string;
  description: string;
  image: string;
  redirectUrl: string;
  contact: string;
  fromDate: string;
  toDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: string;
}

// Define Banner Response interface
export interface BannerResponse {
  totalPages: string;
  page: string;
  limit: string;
  totalActiveBanners: string;
  banners: Banner[];
}

export interface Post {
  _id: string;
  type: string;
  title: string;
  description: string;
  image: string;
  startDate: string ;
  endDate: string ;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  mapUrl: string;
  createdBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: string;
}

// Define Post Response interface
export interface PostResponse {
  totalPages: string;
  page: string;
  limit: string;
  totalPosts: string;
  posts: Post[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private headers: any = [];
  profileData: any;
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  // Existing methods
  async signIn(data: any) {
    try {
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SIGN_IN,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      if (response.status == 200 && response.data != null) {
        this.storage.clearAll();
        this.storage.set(common.TOKEN, response.data.token || response.data); // Handle both cases
        
        // Try to decode the token
        try {
          const decodedToken = this.decodeToken(response.data.token || response.data);
          if (decodedToken && decodedToken.adminId) {
            this.profileData = { _id: decodedToken.adminId };
            this.storage.set(common.USER_DATA, this.profileData);
          }
        } catch (e) {
          console.error('Token decoding error:', e);
        }
        
        return true;
      } else {
        swalHelper.showToast(response.message || 'Login failed', 'warning');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }
  
  private decodeToken(token: string): any {
    try {
      if (!token) return null;
      
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Decode the payload part
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      console.log(decoded)
      return JSON.parse(decoded);
    } catch (e) {
      console.error('Token decoding failed:', e);
      return null;
    }
  }
  
  getCurrentUser() {
    // First try to get from memory
    if (this.profileData && this.profileData._id) {
      return this.profileData;
    }
    
    // Then try to get from storage
    const storedUser = this.storage.get(common.USER_DATA);
    if (storedUser && storedUser._id) {
      this.profileData = storedUser;
      return this.profileData;
    }
    
    // Finally try to decode from token
    const token = this.storage.get(common.TOKEN);
    if (token) {
      try {
        const decoded = this.decodeToken(token);
        if (decoded && decoded.adminId) {
          this.profileData = { _id: decoded.adminId };
          this.storage.set(common.USER_DATA, this.profileData);
          return this.profileData;
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    
    return null;
  }

  async getUsers(data: any) {
    try {
      this.getHeaders();
      console.log('Sending Request Body:', data);
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_USERS,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log('API Response:', response);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
      throw error;
    }
  }

  // New Banner related methods
  async createBanner(formData: FormData) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_BANNER,
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to create banner', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Create Banner Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }

  async getAllBanners(page: number = 1, limit: number = 10) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_BANNERS,
          method: 'POST',
        },
        { page, limit },
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data as BannerResponse;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch banners', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Get Banners Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }

  async updateBanner(formData: FormData) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_BANNER,
          method: 'POST',
        },
        formData,
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update banner', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Update Banner Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }

  async deleteBanner(bannerId: string) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_BANNER,
          method: 'POST',
        },
        { bannerId },
        this.headers
      );
      
      if (response.status === 200) {
        return true;
      } else {
        swalHelper.showToast(response.message || 'Failed to delete banner', 'warning');
        return false;
      }
    } catch (error) {
      console.error('Delete Banner Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }

  // Helper method to get the full image URL
  

  async getUserTypes(): Promise<UserTypesResponse> {
    try {
      this.getHeaders();
      
      // Use the same URL construction approach that worked in your original component
      const token = this.storage.get(common.TOKEN);
      console.log('Auth token available:', !!token);
                                      
      // Try with a manually constructed URL, like you did before
      
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_USER_TYPES,
          method: 'POST'
        },
        {}, // Try with empty object instead of null
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data as UserTypesResponse;
      } else {
        console.error('API returned non-200 status:', response);
        swalHelper.showToast('Failed to fetch user types', 'error');
        throw new Error('Failed to fetch user types');
      }
    } catch (error) {
      console.error('Error fetching user types:', error);
      swalHelper.showToast('Error fetching user types', 'error');
      throw error;
    }
  }
  // Fix the deleteUser method to accept a string userId and convert it to the expected format
  async deleteUser(userId: string) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_USER,
          method: 'POST',
        },
        { userId }, // Convert string to object with userId property
        this.headers
      );
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to delete user', 'error');
      throw error;
    }
  }

  async getAllCoupons(page: number = 1, limit: number = 10): Promise<CouponResponse> {
    this.getHeaders();
    try {
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_COUPONS,
          method: 'POST',
        },
        { page, limit },
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch coupons', 'error');
        return { totalPages: '0', page: '1', limit: '10', totalActiveCoupons: '0', coupons: [] };
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      swalHelper.showToast('Something went wrong while fetching coupons', 'error');
      return { totalPages: '0', page: '1', limit: '10', totalActiveCoupons: '0', coupons: [] };
    }
  }
  
  
  
  
  async updateCoupon(formData: FormData) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_COUPON,
          method: 'POST',
        },
        formData,
        this.headers
      );
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to update coupon', 'error');
      throw error;
    }
  }

  async createSubscription(formData: FormData) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_SUBSCRIPTION,
          method: 'POST',
        },
        formData,
        this.headers
      );
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to create subscription', 'error');
      throw error;
    }
  }
 


// Add these methods to your existing AuthService class

// Method to get all coupons with pagination


//lper method to get image URL
getImageUrl(relativePath: string): string {
  if (!relativePath) return 'assets/images/placeholder-image.png';
  return `${environment.imageUrl}/${relativePath}`;
}

async createCoupon(formData: FormData): Promise<any> {
  this.getHeaders();
  try {
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.CREATE_COUPON,
        method: 'POST',
      },
      formData,
      this.headers
    );

    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      swalHelper.showToast(response.message || 'Failed to create coupon', 'error');
      return null;
    }
  } catch (error) {
    console.error('Error creating coupon:', error);
    swalHelper.showToast('Something went wrong while creating coupon', 'error');
    return null;
  }
}


// Method to create a new coupon

// Method to delete a coupon
async deleteCoupon(couponId: string): Promise<boolean> {
  this.getHeaders();
  try {
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.DELETE_COUPON,
        method: 'POST',
      },
      { couponId },
      this.headers
    );
    
    if (response.status === 200) {
      return true;
    } else {
      swalHelper.showToast(response.message || 'Failed to delete coupon', 'error');
      return false;
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
    swalHelper.showToast('Something went wrong while deleting coupon', 'error');
    return false;
  }
}

// Add these to your AuthService class in auth.service.ts

// Define Post interface


// Add these methods to your AuthService class

async getAllPosts(page: number = 1, limit: number = 10) {
  try {
    this.getHeaders();
    const data = { page, limit };
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.GET_ALL_POSTS,
        method: 'POST',
      },
      data,
      this.headers
    );
    
    if (response.status === 200 && response.data) {
      return response.data as PostResponse;
    } else {
      swalHelper.showToast(response.message || 'Failed to fetch posts', 'warning');
      return null;
    }
  } catch (error) {
    console.error('Get Posts Error:', error);
    swalHelper.showToast('Something went wrong!', 'error');
    throw error;
  }
}

async createPost(formData: FormData) {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.CREATE_POST,
        method: 'POST',
      },
      formData,
      this.headers
    );
    
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      swalHelper.showToast(response.message || 'Failed to create post', 'warning');
      return null;
    }
  } catch (error) {
    console.error('Create Post Error:', error);
    swalHelper.showToast('Something went wrong!', 'error');
    throw error;
  }
}

async updatePost(formData: FormData) {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.UPDATE_POST,
        method: 'POST',
      },
      formData,
      this.headers
    );
    
    if (response.status === 200 && response.data) {
      return response.data;
    } else {
      swalHelper.showToast(response.message || 'Failed to update post', 'warning');
      return null;
    }
  } catch (error) {
    console.error('Update Post Error:', error);
    swalHelper.showToast('Something went wrong!', 'error');
    throw error;
  }
}

async deletePost(postId: string) {
  try {
    this.getHeaders();
    const data = { postId };
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.DELETE_POST,
        method: 'POST',
      },
      data,
      this.headers
    );
    
    if (response.status === 200) {
      return true;
    } else {
      swalHelper.showToast(response.message || 'Failed to delete post', 'warning');
      return false;
    }
  } catch (error) {
    console.error('Delete Post Error:', error);
    swalHelper.showToast('Something went wrong!', 'error');
    throw error;
  }
}}


