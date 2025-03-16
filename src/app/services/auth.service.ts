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
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_USERS, method: 'POST' },
        data,
        this.headers
      );
      return response.status === 200 ? response.data : null;
    } catch {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }
  
  async deleteUser(data: any): Promise<boolean> {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_DELETE, method: 'POST' },
        data,
        this.headers
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }
}  
    