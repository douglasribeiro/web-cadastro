import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Interprete } from './interprete';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InterpreteService {
  private apiUrl = 'http://localhost:8081/api/interprete';

  constructor(private http: HttpClient) {}

  getList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  salvarInterprete(novoInterprete: Interprete): Observable<Interprete> {
    novoInterprete.id  = null;
    const payload = {
      ...novoInterprete,
    };

    return this.http.post<Interprete>(this.apiUrl, payload).pipe(
      catchError(this.handleError), // Captura o erro aqui
    );
  }

  alterarInterprete(upInterprete: Interprete){
      const payload = {
        ...upInterprete,
      };
      return this.http.patch<Interprete>(this.apiUrl+'/'+payload.id, payload).pipe(
        catchError(this.handleError)
      );
    }

  private handleError(error: HttpErrorResponse) {
    let mensagem = 'Ocorreu um erro inesperado';

    if (error.error instanceof ErrorEvent) {
      mensagem = `Erro: ${error.error.message}`;
    } else {
      mensagem = `Código: ${error.status}, Mensagem: ${error.message}`;
    }

    return throwError(() => new Error(mensagem));
  }

  excluir(id: number): Observable<void> {
    // Monta a URL no formato: ://sua-api.com
    const urlCompleta = `${this.apiUrl}/${id}`;

    return this.http.delete<void>(urlCompleta).pipe(
      catchError(this.handleError), // Reaproveita sua função de tratamento de erro
    );
  }
}
