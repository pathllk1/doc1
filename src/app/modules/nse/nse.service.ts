import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NSEService {
  private apiUrl = '/api/nse'; // Base URL for the API

  constructor(private http: HttpClient) {}
  
  getFolioData(): Observable<any> {
    const sampleData = { 
      id: 1,
      name: 'Sample Folio',
      balance: 1000
    };
    return of(sampleData);
  }

  // Method to call get_nse API endpoint
  getNSERecords(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_nse`);
  }

  // Method to call upsert_folio API endpoint
  upsertFolio(folioData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/upsert_folio`, folioData);
  }

  // Method to call getAllFolioRecords API endpoint
  getAllFolioRecords(): Observable<any> {
    return this.http.get(`${this.apiUrl}/folio`);
  }

  getAllCnNote(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cn_note`);
  }

  gs_sheet(): Observable<any> {
    return this.http.get(`${this.apiUrl}/gs_record`);
  }

  submitData(formData: any, recordsData: any[]): Observable<any> {
    const payload = {
      formData,
      recordsData
    };
    return this.http.post<any>(`${this.apiUrl}/addnse_data`, payload);
  }

  updateData(formData: any, recordsData: any[]): Observable<any> {
    const payload = {
      formData,
      recordsData
    };
    return this.http.post<any>(`${this.apiUrl}/updnse_data`, payload);
  }
}
