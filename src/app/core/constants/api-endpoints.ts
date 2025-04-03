import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  public SIGN_IN: string = `${this.PATH}/Signin`;
  

  public GET_USERS: string = `${this.PATH}/searchUsers`;
  public DELETE_USER: string = `${this.PATH}/deleteUsers`;
  
  public CREATE_BANNER: string = `${this.PATH}/createBanner`; 
  public CREATE_COUPON: string = `${this.PATH}/createCoupon`; 
  public UPDATE_COUPON: string = `${this.PATH}/updateCoupon`;
  public  GET_ALL_COUPONS: string = `${this.PATH}/getAllCoupons`;
  public  DELETE_COUPON: string = `${this.PATH}/deleteCoupon`;
  // Add this

  public UPDATE_USER: string = `${this.PATH}/updateUser`;
  public CREATE_SUBSCRIPTION: string = `${this.PATH}/createSubscription`;
  // Add these to your ApiEndpoints class in api-endpoints.ts
public CREATE_POST: string = `${this.PATH}/createPost`;
public UPDATE_POST: string = `${this.PATH}/updatePost`;
public   GET_ALL_POSTS: string = `${this.PATH}/getAllPosts`;
public DELETE_POST: string = `${this.PATH}/deletePost`;
public GET_USER_TYPES: string = `${this.PATH}/getAllUserType`;
public  GET_ALL_BANNERS: string = `${this.PATH}/getAllBanners`;
  public   UPDATE_BANNER: string = `${this.PATH}/updateBanner`;
  public   DELETE_BANNER: string = `${this.PATH}/deleteBanner`;
  
  
 
}

export let apiEndpoints = new ApiEndpoints();


