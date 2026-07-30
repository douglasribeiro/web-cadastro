import { BancoService } from './../banco.service';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorInterceptor } from '../../errorInterceptor';
import { MatIconModule } from '@angular/material/icon';
import { Banco } from './banco';

@Component({
  selector: 'app-banco',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './banco.component.html',
  styleUrl: '../../app.component.css',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class BancoComponent implements OnInit {
  private readonly bancoService = inject(BancoService);
  public carregando = signal<boolean>(true);
  termoBusca = signal('');
  paginaAtual = signal(1);
  itensPorPagina = signal(5);
  itemParaExcluir = signal<Banco | null>(null);
  showModalExcluir = signal(false);
  itemSelecionado: Partial<Banco> = {};
  showModalSucesso = signal(false);
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  situacao = signal<'INCLUSÃO' | 'ALTERAÇÃO' | 'NEUTRO'>('NEUTRO');
  public bancos = signal<Banco[]>([]);
  code: string;
  display: string | boolean;
  digits: string;
  locale: string;
  showModalStd = signal(false);
  //mensagemErro = signal('');
  mensagemStd = signal('');
  mensagemHeadStd = signal('');

  ngOnInit(): void {
    this.view.set('LISTA');
    this.situacao.set('NEUTRO');
    this.carregarLista();
  }

  carregarLista(): void {
    this.bancoService.getList().subscribe({
      next: (dados: any) => {
        console.log(dados);
        this.bancos.set(dados.data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar Bancos', err);
        this.carregando.set(false);
      },
    });
  }

  filtrar(v: string) {
    this.termoBusca.set(v);
    this.paginaAtual.set(1);
  }

  novo() {
    this.itemSelecionado = {
      id: 0,
      nome: '',
      saldo: 0,
	    limite: 0,
      dtAbertura: null,
	    nuAgencia: '',
      nuConta: '',
      noGerente: '',
      endereco: '',
      telefone: ''
    }
    this.view.set('EDICAO');
    this.situacao.set('INCLUSÃO');
  }

  itensPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.listaFiltrada().slice(inicio, inicio + this.itensPorPagina());
  });

  listaFiltrada = computed(() => {
    const busca = this.termoBusca().toLowerCase();
    return this.bancos().filter((m) => m.nome.toLowerCase().includes(busca));
  });

  editar(reg: Banco) {
    console.log('Metodo Editar.');
    this.itemSelecionado = { ...reg };
    this.view.set('EDICAO');
    this.situacao.set('ALTERAÇÃO');
  }

  prepararExclusao(m: Banco) {
      this.itemParaExcluir.set(m);
      this.showModalExcluir.set(true);
    }

  mudarLimite(l: string) {
    this.itensPorPagina.set(Number(l));
    this.paginaAtual.set(1);
  }

  totalPaginas = computed(
    () => Math.ceil(this.listaFiltrada().length / this.itensPorPagina()) || 1,
  );

  mudarPagina(d: number) {
    this.paginaAtual.update((p) => p + d);
  }

  cancelar() {
    this.view.set('EDICAO');
    this.situacao.set('NEUTRO');
    this.carregarLista();
  }


  salvar() {
    const dadosParaSalvar = this.itemSelecionado as Banco;
    if (this.situacao() === 'INCLUSÃO') {
      this.bancoService.salvarBanco(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Salvo com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao salvar:', err),
      });
    } else {
      this.bancoService.alterarBanco(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Alterado com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao editar:', err),
      });
    }
  }

  // Método auxiliar para evitar repetição de código
  private finalizarOperacao() {
    this.showModalSucesso.set(true);
    this.situacao.set('NEUTRO');
    this.carregarLista(); // Agora sim, carrega a lista atualizada do servidor
  }
    fecharSucesso() {
      this.showModalSucesso.set(false);
      this.situacao.set('NEUTRO');
    }

    confirmarExclusao() {
    this.bancos.update((l) =>
      l.filter((i) => i.id !== this.itemParaExcluir()?.id),
    );
    if (this.itensPaginados().length === 0 && this.paginaAtual() > 1)
      this.paginaAtual.update((p) => p - 1);
    this.bancoService.excluir(this.itemParaExcluir()?.id).subscribe({
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

  fecharStd() {
    this.showModalStd.set(false);
  }

  fecharModal() {
    this.showModalExcluir.set(false);
    this.itemParaExcluir.set(null);
  }
}
