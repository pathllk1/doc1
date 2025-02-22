import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TstService {
  apiUrl = '/api/tst/';
  constructor(private http: HttpClient) { }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'get_tst');
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'get_all');
  }

  addTst(data:any) {
    const body = data
    const headers = { 'content-type': 'application/json'}  
    return this.http.post(this.apiUrl + 'add_tst', body, {'headers':headers});
  }
}
