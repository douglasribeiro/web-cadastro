import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CartaoCredito } from './cartao-credito';
import { CartaoCreditoService } from './cartao-credito.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from '../../errorInterceptor';
import { BancoService } from '../banco/banco.service';
import { Banco } from '../banco/banco';

@Component({
  selector: 'app-cartao-credito',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './cartao-credito.component.html',
  styleUrl: '../../app.component.css',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class CartaoCreditoComponent implements OnInit{

  private readonly service = inject(CartaoCreditoService);
  private readonly serviceBancos = inject(BancoService);
  bancos = signal<Banco[]>([]);
  public carregando = signal<boolean>(true);
  termoBusca = signal('');
  paginaAtual = signal(1);
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  itensPorPagina = signal(5);
  public cartoes = signal<CartaoCredito[]>([]);
  itemSelecionado: Partial<CartaoCredito> = {};
  situacao = signal<'INCLUSÃO' | 'ALTERAÇÃO' | 'NEUTRO'>('NEUTRO');
  itemParaExcluir = signal<CartaoCredito | null>(null);
  showModalExcluir = signal(false);
  showModalSucesso = signal(false);
  showModalStd = signal(false);
  mensagemStd = signal('');
  mensagemHeadStd = signal('');

  ngOnInit(): void {
    this.view.set('LISTA');
    this.situacao.set('NEUTRO');
    this.carregarLista();
  }

  novo() {
    this.itemSelecionado = {
      id: 0,
      contaBancaria: null,
      nomeCartao: '',
      bandeira: '',
      limiteTotal: 0,
      limiteDisponivel: 0,
      diaFechamento: null,
      diaVencimento: null,
    }
    this.view.set('EDICAO');
    this.situacao.set('INCLUSÃO');
    this.cargaBancos();
  }

  filtrar(v: any) {
    this.termoBusca.set(v);
    this.paginaAtual.set(1);
  }

  itensPaginados = computed(() => {
      const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
      return this.listaFiltrada().slice(inicio, inicio + this.itensPorPagina());
  });

  listaFiltrada = computed(() => {
    const busca = this.termoBusca().toLowerCase();
    return this.cartoes().filter((m) => m.nomeCartao.toLowerCase().includes(busca));
  });

  editar(reg: CartaoCredito) {
    this.cargaBancos();
    console.log('Metodo Editar.');
    this.itemSelecionado = { ...reg };
    this.view.set('EDICAO');
    this.situacao.set('ALTERAÇÃO');
  }

  prepararExclusao(m: CartaoCredito) {
    this.itemParaExcluir.set(m);
    this.showModalExcluir.set(true);
  }

  totalPaginas = computed(
    () => Math.ceil(this.listaFiltrada().length / this.itensPorPagina()) || 1,
  );

  mudarPagina(d: number) {
    this.paginaAtual.update((p) => p + d);
  }

  mudarLimite(l: string) {
    this.itensPorPagina.set(Number(l));
    this.paginaAtual.set(1);
  }

  salvar() {
    const dadosParaSalvar = this.itemSelecionado as CartaoCredito;
    if (this.situacao() === 'INCLUSÃO') {
      this.service.salvarCartao(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Salvo com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao salvar:', err),
      });
    } else {
      this.service.alterarCartao(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Alterado com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao editar:', err),
      });
    }
  }

  private finalizarOperacao() {
    this.showModalSucesso.set(true);
    this.situacao.set('NEUTRO');
    this.carregarLista(); // Agora sim, carrega a lista atualizada do servidor
  }

  carregarLista(): void {
    this.service.getList().subscribe({
      next: (dados: any) => {
        console.log(dados.data);
        this.cartoes.set(dados.data);
        console.log(this.cartoes[0]);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar Cartões', err);
        this.carregando.set(false);
      },
    });
  }

  fecharSucesso() {
    this.showModalSucesso.set(false);
    this.situacao.set('NEUTRO');
  }

  fecharStd() {
    this.showModalStd.set(false);
  }

  fecharModal() {
    this.showModalExcluir.set(false);
    this.itemParaExcluir.set(null);
  }

  cargaBancos(): void {
    this.bancos.set([]);
    this.serviceBancos.getList().subscribe({
      next: (dados: any) => {
        console.log(dados.data);
        this.bancos.set(dados.data);

        // Correção: Invocar o Signal para ler o valor
        console.log(this.bancos()[0]);

        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar Bancos', err);
        this.carregando.set(false);
      },
    });
  }

  compararBancos(banco1: any, banco2: any): boolean {
    // Se ambos forem nulos ou indefinidos, são iguais
    if (!banco1 || !banco2) return banco1 === banco2;

    // Modifique 'id' para o nome da chave primária do seu banco (ex: idConta, id, etc.)
    return banco1.id === banco2.id;
  }

  confirmarExclusao() {
    this.cartoes.update((l) =>
      l.filter((i) => i.id !== this.itemParaExcluir()?.id),
    );
    if (this.itensPaginados().length === 0 && this.paginaAtual() > 1)
      this.paginaAtual.update((p) => p - 1);
    this.service.excluir(this.itemParaExcluir()?.id).subscribe({
      next: (res) => {
        this.mensagemHeadStd.set('Excluir registro');
        this.mensagemStd.set('Registro excluido com sucesso');
        this.showModalStd.set(true);
        //console.log('Excluido com sucesso!', res);
      },
      error: (err) => {
        console.error('Erro ao excluir:', err);
      },
    });
    this.fecharModal();
  }

}
