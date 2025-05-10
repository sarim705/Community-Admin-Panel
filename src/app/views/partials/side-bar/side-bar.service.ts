import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Startup Weaver',
     
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'activity', 
        },
        {
          title:'Registeration',
          link:'registerComponent',
          icon:'rss'
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users', 
        },
        
        {
          title: 'Countries',
          link: 'country',
          icon: 'gift', 
        },

        {
          title: 'States',
          link: 'states',
          icon: 'volume-2', 
        },
        {
          title: 'City',
          link:'city',
          icon:'book'
        },

        {
          title: 'Chapter',
          link:'chapter',
          icon:'book'
        },

        {
          title: 'Category',
          link:'category',
          icon:'book'
        },
        {
          title: 'LeaderBoard',
          link:'leaderboard',
          icon:'book'
        },

        {
          title: 'events',
          link: 'events',
          icon: 'dollar-sign', 
        },
       

        {
          title: 'Attendence',
          link:'attendence',
          icon:'rss'
        },
        {
          title: 'Referral Given Report',
          link:'referralReport',
          icon:'rss'
        },
        {
          title: 'Testimonial Report',
          link:'testimonialReport',
          icon:'rss'
        },
        {
          title: 'referral Recieved Report',
          link:'referralReportRecieved',
          icon:'rss'
        },
        {
          
          title: 'one To one Report',
          link:'oneTooneReport',
          icon:'rss'
      
        },{
        title:'tyfcb Report',
        link:'tyfcb',
        icon:'rss'},
        {
          title:'Visitors Report',
          link:'VisitorsReport',
          icon:'rss'
        },
        

        {
          title:'Attendance Record',
          link:'attendanceRecord',
          icon:'rss'
        },
        
        {
          title:'Referral Points Point',
          link:'referralPoints',
          icon:'rss'
        },

        
      
       
      ]
      
    },
    
  ];
  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
  }
  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}

