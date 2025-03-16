import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  totalItems: number = 0;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  searchQuery: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    const requestData = {
      search: this.searchQuery,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.authService.getUsers(requestData).then((data) => {
      if (data) {
        this.users = data.users;
        this.totalItems = data.total;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.fetchUsers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.fetchUsers();
  }

     
  }

