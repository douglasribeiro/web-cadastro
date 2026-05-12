import { Interprete } from "../interprete/interprete";

export interface Musica {
  id: number;
  nome: string; // edit, list
  interprete: Interprete; // edit, list
	album: string; // edit, list
	gravadora: Gravadora; // edit
	lancamento: string; // edit, list
	compositor: string;
	intervalo: number; // edit
	duracaoSegundos: bigint; // edit
	introducao: bigint; // edit
	genero: Genero; // edit
	caminhoArquivo: string;
	ArquivoUrl: string;
  capa?: Blob;
}


export interface Genero {
  id: number;
  nome: string;
}

export interface Gravadora {
  id: number;
  nome: string;
}

export interface MusicaRequest {
  id: number;
  nome: string; // edit, list
  interprete: string; // edit, list
	album: string; // edit, list
	gravadora: string; // edit
	lancamento: string; // edit, list
	compositor: string;
	intervalo: number; // edit
	duracaoSegundos: bigint; // edit
	introducao: bigint; // edit
	genero: string; // edit
	caminhoArquivo: string;
	ArquivoUrl: string;
  capa?: Blob;
}
