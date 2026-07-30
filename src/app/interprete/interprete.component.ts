import { CommonModule } from '@angular/common'; // <-- Verifique este
import { FormsModule } from '@angular/forms'; // <-- E este
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Interprete } from './interprete';
import { InterpreteService } from './interprete.service';

@Component({
  selector: 'app-interprete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    TextFieldModule,
  ],
  templateUrl: './interprete.component.html',
  styleUrl: '../app.component.css',
})
export class InterpreteComponent implements OnInit {
  private interpreteService = inject(InterpreteService);
  termoBusca = signal('');
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  paginaAtual = signal(1);
  itemSelecionado: Partial<Interprete> = {};
  situacao = signal<'INCLUSÃO' | 'ALTERAÇÃO' | 'NEUTRO'>('NEUTRO');
  public interpretes = signal<Interprete[]>([]);
  public carregando = signal<boolean>(true);
  itensPorPagina = signal(5);
  itemParaExcluir = signal<Interprete | null>(null);
  showModalExcluir = signal(false);
  showModalSucesso = signal(false);

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista(): void {
    this.view.set('LISTA');
    this.interpreteService.getList().subscribe({
      next: (dados: any) => {
        this.interpretes.set(dados.data);
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
      nome: '',
      id: 0,
      genero: '',
      origem: '',
      desde: '',
      sobre: '',
    };
    this.view.set('EDICAO');
    this.situacao.set('INCLUSÃO');
  }

  itensPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.listaFiltrada().slice(inicio, inicio + this.itensPorPagina());
  });

  listaFiltrada = computed(() => {
    const busca = this.termoBusca().toLowerCase();
    return this.interpretes().filter((m) =>
      m.nome.toLowerCase().includes(busca),
    );
  });

  editar(m: Interprete) {
    console.log('Metodo Editar.');
    this.itemSelecionado = { ...m };
    this.view.set('EDICAO');
    this.situacao.set('ALTERAÇÃO');
  }

  prepararExclusao(m: Interprete) {
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
  const dadosParaSalvar = this.itemSelecionado as Interprete;

  if (this.situacao() === 'INCLUSÃO') {
    this.interpreteService.salvarInterprete(dadosParaSalvar).subscribe({
      next: (res) => {
        console.log('Salvo com sucesso!', res);
        this.finalizarOperacao(); // Chama a limpeza após o sucesso
      },
      error: (err) => console.error('Erro ao salvar:', err),
    });
  } else {
    this.interpreteService.alterarInterprete(dadosParaSalvar).subscribe({
      next: (res) => {
        console.log('Alterado com sucesso!', res);
        this.finalizarOperacao(); // Chama a limpeza após o sucesso
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
}
