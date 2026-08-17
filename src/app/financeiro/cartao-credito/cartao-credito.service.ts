import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CartaoCredito } from './cartao-credito';

@Injectable({
  providedIn: 'root'
})
export class CartaoCreditoService {

  private apiUrl = 'http://localhost:8081/api/cc';

  constructor(private readonly http: HttpClient) { }

  getList(): Observable<CartaoCredito[]> {
    return this.http.get<CartaoCredito[]>(this.apiUrl);
  }

  salvarCartao(novoCartao: CartaoCredito): Observable<CartaoCredito> {
      novoCartao.id  = null;
      const payload = {
        ...novoCartao,
      };

      return this.http.post<CartaoCredito>(this.apiUrl, payload).pipe(
        catchError(this.handleError), // Captura o erro aqui
      );
    }

    alterarCartao(upCartao: CartaoCredito){
        const payload = {
          ...upCartao,
        };
        return this.http.patch<CartaoCredito>(this.apiUrl+'/'+payload.id, payload).pipe(
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

