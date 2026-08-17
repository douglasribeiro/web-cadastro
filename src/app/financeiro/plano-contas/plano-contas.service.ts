import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlanoContas } from './plano-coontas';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanoContasService {

  private apiUrl = 'http://localhost:8081/api/planoContas';

  constructor(private readonly http: HttpClient) { }

  getList(): Observable<PlanoContas[]> {
    console.log('Service - getlist plano de contas')
    return this.http.get<PlanoContas[]>(this.apiUrl);
  }

  salvar(novaConta: PlanoContas): Observable<PlanoContas> {
    novaConta.id  = null;
    const payload = {
      ...novaConta,
    };

    return this.http.post<PlanoContas>(this.apiUrl, payload).pipe(
      catchError(this.handleError), // Captura o erro aqui
    );
  }

  alterar(upCartao: PlanoContas){
    const payload = {
      ...upCartao,
    };
    return this.http.patch<PlanoContas>(this.apiUrl+'/'+payload.id, payload).pipe(
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
