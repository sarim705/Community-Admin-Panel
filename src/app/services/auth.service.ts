import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { Observable, of } from 'rxjs';

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
        this.storage.set(common.TOKEN, response.data);
        return true;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }
  
  async getUsers(data: any) {
    try {
      this.getHeaders();
      console.log('Sending Request Body:', data); // Log the request body
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_USERS,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log('API Response:', response); // Log the API response
      return response.data;
    } catch (error) {
      console.error('API Error:', error); // Log the error
      swalHelper.showToast('Failed to fetch users', 'error');
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
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to create banner', 'error');
      throw error;
    }
  }
  
  async createCoupon(formData: FormData) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_COUPON,
          method: 'POST',
        },
        formData,
        this.headers
      );
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to create coupon', 'error');
      throw error;
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
    this.getHeaders(); // Assuming this method sets up headers
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.CREATE_SUBSCRIPTION, // You'll need to add this to your apiEndpoints
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

/*async updateSubscription(formData: FormData) {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.UPDATE_SUBSCRIPTION, // You'll need to add this to your apiEndpoints
        method: 'POST',
      },
      formData,
      this.headers
    );
    return response.data;
  } catch (error) {
    swalHelper.showToast('Failed to update subscription', 'error');
    throw error;
  }
}

async getAllSubscriptions(params?: any) {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: apiEndpoints.GET_ALL_SUBSCRIPTIONS, // You'll need to add this to your apiEndpoints
        method: 'GET',
        params: params
      },
      null,
      this.headers
    );
    return response.data;
  } catch (error) {
    swalHelper.showToast('Failed to fetch subscriptions', 'error');
    throw error;
  }
}

// Optional: Method to delete a subscription if needed
async deleteSubscription(subscriptionId: string) {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: `${apiEndpoints.DELETE_SUBSCRIPTION}/${subscriptionId}`,
        method: 'DELETE',
      },
      null,
      this.headers
    );
    return response.data;
  } catch (error) {
    swalHelper.showToast('Failed to delete subscription', 'error');
    throw error;
  }
}
}*/}