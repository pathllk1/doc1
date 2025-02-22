import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Doc {
  id: number;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocsService {
  private apiUrl = '/api/docs/'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) { }

  getAllDocs(): Observable<Doc[]> {
    return this.http.get<Doc[]>(this.apiUrl);
  }

  getDocById(id: number): Observable<Doc> {
    return this.http.get<Doc>(`${this.apiUrl}/${id}`);
  }

  createDoc(doc: Omit<Doc, 'id'>): Observable<Doc> {
    return this.http.post<Doc>(this.apiUrl, doc);
  }

  updateDoc(id: number, doc: Partial<Doc>): Observable<Doc> {
    return this.http.put<Doc>(`${this.apiUrl}/${id}`, doc);
  }

  deleteDoc(id: any): Observable<void> {
    return this.http.delete<void>(this.apiUrl + `delete_doc/${id}`);
  }

  searchDocs(query: string): Observable<Doc[]> {
    return this.http.get<Doc[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'send_email');
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'get_docs');
  }

  addTst(data:any) {
    const body = data
    const headers = { 'content-type': 'application/json'}  
    return this.http.post(this.apiUrl + 'add_edit', body, {'headers':headers});
  }
}
