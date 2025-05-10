import { Referral } from './../../services/auth.service';
import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  private PATH1: string = `${environment.baseURL}`;
  
  // User Management
  public GET_USERS: string = `${this.PATH}/`;
  public UPDATE_USER_STATUS: string = `${this.PATH}/status`;
  public DELETE_USER: string = `${this.PATH}/delete`;
  public GET_USER_DETAILS: string = `${this.PATH}/details`;
  public GET_ALL_COUNTRIES: string= `${this.PATH}/master/getAllCountries`
    public CREATE_COUNTRY: string= `${this.PATH}/master/createCountry`
   public DELETE_COUNTRY: string= `${this.PATH}/master/deleteCountry`
    public GET_COUNTRY_BY_ID: string= `${this.PATH}/master/getCountryById`
        public   UPDATE_COUNTRY: string= `${this.PATH}/master/updateCountry`

        public GET_ALL_STATES: string= `${this.PATH}/master/getAllStates`
              public  CREATE_STATE: string= `${this.PATH}/master/createState`
            public  DELETE_STATE: string= `${this.PATH}/master/deleteState`
            public GET_STATE_BY_ID: string= `${this.PATH}/master/getStateById`
        public   UPDATE_STATE: string= `${this.PATH}/master/updateState`

        public GET_DASHBOARD_COUNTS: string = `${this.PATH}/getdata/counts`
    


public  GET_ALL_EVENTS: string= `${this.PATH}/event/getAllEvents`
            public CREATE_EVENT: string= `${this.PATH}/event/createEvent`
       

        public DELETE_EVENT: string = `${this.PATH}/event/deleteEvent/:eventId`

            public ADD_PHOTOS_TO_EVENT: string = `${this.PATH}/event/`

            public ADD_VIDEOS_TO_EVENT: string = `${this.PATH}/event/`
            

             public UPDATE_EVENT: string= `${this.PATH}/event/updateEvent/:eventId`
             public     GET_ALL_ATTENDANCE: string= `${this.PATH}/event/getAllAttendance`

         

        public DELETE_ATTENDANCE:string= `${this.PATH}/event/deleteAttendance/:attendanceId`
 
        public  CREATE_CHAPTER :string= `${this.PATH}/master/createChapter`
        public   UPDATE_CHAPTER :string= `${this.PATH}/master/updateChapter`
        public  GET_CHAPTER_BY_ID:string= `${this.PATH}/master/getChapterById`
        public DELETE_CHAPTER :string= `${this.PATH}/master/deleteChapter`
        public GET_ALL_CHAPTERS :string= `${this.PATH}/master/getChapters`

        public  CREATE_CATEGORY:string=`${this.PATH}/master/createCategory`
 public  GET_CATEGORIES:string=`${this.PATH}/master/getCategories`
  public   UPDATE_CATEGORY:string=`${this.PATH}/master/updateCategory`
public   DELETE_CATEGORY  :string=`${this.PATH}/master/deleteCategory`
public    GET_CATEGORY_BY_ID  :string=`${this.PATH}/master/getCategoryById`
public      CREATE_CITY  :string=`${this.PATH}/master/createCity`
public     GET_ALL_CITIES :string=`${this.PATH}/master/getCities`
public     GET_CITY_BY_ID :string=`${this.PATH}/master/getCityById`
public UPDATE_CITY:string=`${this.PATH}/master/updateCity`
public  DELETE_CITY:string=`${this.PATH}/api/cities`

public  CREATE_LEADERBOARD:string=`${this.PATH}/master/createLeaderboard`
public  GET_ALL_LEADERBOARDS:string=`${this.PATH}/master/getAllLeaderboards`
public  GET_LEADERBOARD_BY_ID:string=`${this.PATH}/master/getLeaderboardById`
public  UPDATE_LEADERBOARD:string=`${this.PATH}/master/updateLeaderboard`
public  DELETE_LEADERBOARD:string=`${this.PATH}/master/deleteLeaderboard`
public  GET_ALL_REFERRALS:string=`${this.PATH1}/referrals/`
public  GET_ALL_TESTIMONIALS:string=`${this.PATH1}/testimonials/`
public  GET_ALL_REFERRALS_RECIEVED:string=`${this.PATH1}/referrals/received`

public GET_ALL_ONE_TO_ONE:string=`${this.PATH1}/oneToOnes/getAllOneToOne`
public GET_ALL_TYFCBS:string=`${this.PATH1}/tyfcbs/getAllTyfcb`
public GET_ALL_VISITORS:string=`${this.PATH1}/users/event/getAllVisitors`
public UPDATE_VISITOR:string=`${this.PATH1}/users/event/updateVisitor`
public REFERRAL_RECEIVED:string=`${this.PATH1}/referrals/received`
public REFERRAL_GIVEN:string=`${this.PATH1}/referrals/given`


public REGISTER_USER:string=`${this.PATH1}/auth/register`


GET_ALL_ATTENDANCE_REPORT:string=`${this.PATH1}/users/event/getAllAttendance`

GET_POINT_HISTORY :string=`${this.PATH1}/users/master/getPointsHistory`

ADMIN_LOGIN :string=`${this.PATH1}/admin/login`

}


export let apiEndpoints = new ApiEndpoints();



