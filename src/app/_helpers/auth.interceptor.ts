import { HTTP_INTERCEPTORS} from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../modules/auth/token-storage.service';

const TOKEN_HEADER_KEY = 'x-access-token'; 

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private token: TokenStorageService, @Inject(PLATFORM_ID) private platformId: any) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    let token;
    if(isPlatformBrowser(this.platformId)) {
     token = this.token.getToken();
    }
    if (token != null) {
      authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, token) });
    }
    return next.handle(authReq);
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
