import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = 'http://localhost:8080/api/musicas';

  constructor(private http: HttpClient) { }

  getList(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }
}
