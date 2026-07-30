export class Banco {
  id: number;
	nome: string;
  saldo: number;
	limite: number;
  dtAbertura: Date;
	nuAgencia: string;
  nuConta: string;
  noGerente: string;
  endereco: string;
  telefone: string;
	movimentacoes: Movimentacao[] = [];
}

export class Movimentacao {
  id: number;
  banco: Banco;
  descricao: string;
  valor: number;
  saldo: number;
  movimento: Movimento;
}

export enum Movimento {
  DEBITO = '1',
  CREDITO = '2'
}
