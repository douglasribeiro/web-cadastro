import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GravadoraService {

  private apiUrl = 'http://localhost:8081/api/gravadora';

  constructor(private http: HttpClient) {}

  getList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
