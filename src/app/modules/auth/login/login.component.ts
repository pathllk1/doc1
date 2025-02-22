import { Component, ViewChild, Inject, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastComponent } from '../toast/toast.component';
import { TokenStorageService } from '../token-storage.service';
import { PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  @ViewChild(ToastComponent) toast!: ToastComponent;

  constructor(private authService: AuthService, private router: Router, private tokenStorage: TokenStorageService, @Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit(): void {
    if(isPlatformBrowser(this.platformId)) {
      if (this.tokenStorage.getToken()) {
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
      }
    }
  }

  onLogin() {
    this.authService.login(this.credentials).subscribe(
      response => {
        this.tokenStorage.saveToken(response.token);
        this.tokenStorage.saveUser(response);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        /* this.roles = this.tokenStorage.getUser().roles; */
        this.reloadPage();
      },
      error => {
        console.error('Login failed', error);
        this.showToast('Login failed. Please check your credentials.');
      }
    );
  }

  showToast(message: string) {
    this.toast.display(message);
  }

  reloadPage(): void {
    window.location.reload();
  }
}
