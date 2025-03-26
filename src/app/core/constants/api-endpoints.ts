import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  public SIGN_IN: string = `${this.PATH}/Signin`;
  

  public GET_USERS: string = `${this.PATH}/searchUsers`;
  public DELETE_USER: string = `${this.PATH}/deleteUsers`;
  
  public CREATE_BANNER: string = `${this.PATH}/createBanner`; // Add this
  public CREATE_COUPON: string = `${this.PATH}/createCoupon`; // Add this
  public UPDATE_COUPON: string = `${this.PATH}/updateCoupon`; // Add this
  public UPDATE_USER: string = `${this.PATH}/updateUser`;
  public CREATE_SUBSCRIPTION: string = `${this.PATH}/createSubscription`;
}



export let apiEndpoints = new ApiEndpoints();


