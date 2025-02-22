import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TstService {
  constructor(private http: HttpClient) { }

  // Define your service methods here

  uploadFile(data:any): Observable<any> {
    const apiEndpoint = 'api/tst/csvtojson';
    const body = data
    const headers = { 'content-type': 'application/json'}
    return this.http.post(apiEndpoint, body, {'headers':headers});
  }
}
