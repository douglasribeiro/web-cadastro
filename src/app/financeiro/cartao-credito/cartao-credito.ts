import { Banco } from "../banco/banco";

export class CartaoCredito {
  id: number;
  contaBancaria: Banco;
  nomeCartao: string;
  bandeira: string;
  limiteTotal: number;
  limiteDisponivel: number;
  diaFechamento: number;
  diaVencimento: number;
}
