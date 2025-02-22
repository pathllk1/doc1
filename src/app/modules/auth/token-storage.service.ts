import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Inject, } from '@angular/core';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private roles: string[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  signOut(): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear();
    }
  }

  public saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  public sbase(): string | null {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('SBASE');
    }
    return null;
  }

  public saveUser(user: any): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(USER_KEY);
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  public getUser(): any {
    if (typeof window !== 'undefined') {
      const user = window.sessionStorage.getItem(USER_KEY);
      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  isLoggedIn() {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof window !== 'undefined') {
        const token = window.sessionStorage.getItem(TOKEN_KEY); // get token from local storage
        if (token) { // Check if token is not null
          const payload = atob(token.split('.')[1]); // decode payload of token
          const parsedPayload = JSON.parse(payload); // convert payload into an Object
          return parsedPayload.exp > Date.now() / 1000; // check if token is expired 
        }
        return false; // If token is null, return false
      }
      return false;
    } else {
      return false;
    }
  }

  isSignedin() {
    if (isPlatformBrowser(this.platformId)) {
      if (typeof window !== 'undefined') {
        return !!window.sessionStorage.getItem(TOKEN_KEY);
      }
      return false;
    } else {
      return false
    }
  }

  isAdmin(): boolean {
    const user = this.getUser();
    this.roles = user.roles;
    if (JSON.stringify(user) != '{}') {
      if (this.roles.includes('ROLE_ADMIN')) {
        return true;
      } else { return false }
    } else { return false }
  }
}
