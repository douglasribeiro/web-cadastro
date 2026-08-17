export class PlanoContas {

  id: number;
  codigoEstrutural: string;
  descricao: string;
  tipo: TipoContaContabil;
  natureza: NaturezaContabil;
  nivel: number;
  analitica: boolean;
}

export enum TipoContaContabil {
  ATIVO,
  PASSIVO,
  RECEITA,
  DESPESA
}

export enum NaturezaContabil {
  DEBITO,
  CREDITO
}
