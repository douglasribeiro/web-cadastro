import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Musica, MusicaRequest } from './musica';

@Injectable({
  providedIn: 'root'
})
export class MusicasService {

  private apiUrl = 'http://localhost:8081/api/musica';

  constructor(private http: HttpClient) { }

  getList(): Observable<Musica[]> {
    return this.http.get<Musica[]>(this.apiUrl);
  }

  salvarMusica(novaMusica: Musica) {
    const payload: MusicaRequest = {
      id: null,
      nome: novaMusica.nome,
      interprete: novaMusica.interprete.nome,
      album: novaMusica.album,
      gravadora: novaMusica.gravadora.nome,
      lancamento: novaMusica.lancamento,
      compositor: novaMusica.compositor,
      intervalo: novaMusica.intervalo,
      duracaoSegundos: novaMusica.duracaoSegundos.toString(),
      introducao: novaMusica.introducao.toString(),
      genero: novaMusica.genero.nome,
      caminhoArquivo: novaMusica.caminhoArquivo,
      ArquivoUrl: novaMusica.ArquivoUrl
    }
    //return this.http.post<MusicaRequest>(this.apiUrl+'/personal', payload).pipe(
    //  catchError(this.handleError) // Captura o erro aqui
    console.log(payload);
    return this.http.post<MusicaRequest>(this.apiUrl+'/personal', payload)
  }

  alterarMusica(upMusica: Musica){
    const payload = {
      ...upMusica,
      duracaoSegundos: upMusica.duracaoSegundos.toString(),
      introducao: upMusica.introducao.toString(),
    };
    console.log(payload);
    return this.http.patch<Musica>(this.apiUrl+'/'+payload.id, payload).pipe(
      catchError(this.handleError)
    );
  }

  // Função centralizada para tratar erros HTTP
  private handleError(error: HttpErrorResponse) {
    let mensagem = 'Ocorreu um erro inesperado';

    if (error.error instanceof ErrorEvent) {
      // Erro no lado do cliente (rede, etc)
      mensagem = `Erro: ${error.error.message}`;
    } else {
      // Erro retornado pelo servidor (404, 500, etc)
      mensagem = `Código: ${error.status}, Mensagem: ${error.message}`;
    }

    //console.error(mensagem);
    return throwError(() => new Error(mensagem));
  }

  excluir(id: number): Observable<void> {
  // Monta a URL no formato: ://sua-api.com
  const urlCompleta = `${this.apiUrl}/${id}`;

  return this.http.delete<void>(urlCompleta).pipe(
    catchError(this.handleError) // Reaproveita sua função de tratamento de erro
  );
}
}
