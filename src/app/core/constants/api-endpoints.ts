import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  public SIGN_IN: string = `${this.PATH}/Signin`;
  

  public GET_USERS: string = `${this.PATH}/getUsersSearch`;
  public GET_DELETE: string = `${this.PATH}/deleteUsers`;


}

export let apiEndpoints = new ApiEndpoints();


