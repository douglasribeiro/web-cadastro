import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Banco } from './banco/banco';

@Injectable({
  providedIn: 'root'
})
export class BancoService {

  private apiUrl = 'http://localhost:8081/api/banco';

  constructor(private readonly http: HttpClient) { }

  getList(): Observable<Banco[]> {
    return this.http.get<Banco[]>(this.apiUrl);
  }

  salvarBanco(novoBanco: Banco): Observable<Banco> {
      novoBanco.id  = null;
      const payload = {
        ...novoBanco,
      };

      return this.http.post<Banco>(this.apiUrl, payload).pipe(
        catchError(this.handleError), // Captura o erro aqui
      );
    }

    alterarBanco(upBanco: Banco){
        const payload = {
          ...upBanco,
        };
        return this.http.patch<Banco>(this.apiUrl+'/'+payload.id, payload).pipe(
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
