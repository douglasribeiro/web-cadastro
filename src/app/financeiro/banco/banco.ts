export class Banco {
  id: number;
  empresa: Empresa;
  bancoCodigo: string;
  nomeConta: string;
  agencia: string;
  numeroConta: string;
  tipoConta: TipoContaBancaria;
  saldoAtual: number;
  limite: number;
}

export class Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
}

export enum TipoContaBancaria {
  CORRENTE = '1',
  POUPANCA = '2',
  INVESTIMENTO = '3'
}
