import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProdutosService } from './produtos.service';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'produtos.component.html',
  styleUrl: '../app.component.css'
})
export class ProdutosComponent {
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  termoBusca = signal('');
  paginaAtual = signal(1);
  itensPorPagina = signal(5);
   showModalExcluir = signal(false);
  itemParaExcluir = signal<any>(null);

  constructor(private produtoService: ProdutosService){}

  lista = signal([
    { id: 1, nome: 'Monitor LED' }, { id: 2, nome: 'Mouse' }, { id: 3, nome: 'Teclado' },
    { id: 4, nome: 'Headset' }, { id: 5, nome: 'Webcam' }, { id: 6, nome: 'Cadeira' },
    { id: 7, nome: 'Mesa' }, { id: 8, nome: 'Notebook' }, { id: 9, nome: 'Impressora' }
  ]);

  // 1. Filtra a lista baseada no termo de busca
  listaFiltrada = computed(() => {
    const busca = this.termoBusca().toLowerCase();
    return this.lista().filter(p => p.nome.toLowerCase().includes(busca));
  });

  // 2. Calcula o total de páginas baseado na lista filtrada
  totalPaginas = computed(() => {
    const total = Math.ceil(this.listaFiltrada().length / this.itensPorPagina());
    return total === 0 ? 1 : total;
  });

  // 3. Fatiar a lista filtrada para exibir apenas a página atual
  itensPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.listaFiltrada().slice(inicio, inicio + this.itensPorPagina());
  });

  mudarLimite(novoLimite: string) {
    this.itensPorPagina.set(Number(novoLimite));
    this.paginaAtual.set(1); // Reset obrigatório para a página 1
  }

  filtrar(valor: string) {
    this.termoBusca.set(valor);
    this.paginaAtual.set(1); // Volta para a página 1 ao pesquisar
  }

  mudarPagina(dir: number) {
    this.paginaAtual.update(p => p + dir);
  }

  itemSelecionado: any;
  novo() { this.itemSelecionado = { id: Date.now(), nome: '' }; this.view.set('EDICAO'); }
  editar(item: any) { this.itemSelecionado = { ...item }; this.view.set('EDICAO'); }
  salvar() {
    const idx = this.lista().findIndex(i => i.id === this.itemSelecionado.id);
    if (idx !== -1) {
      const n = [...this.lista()]; n[idx] = this.itemSelecionado; this.lista.set(n);
    } else { this.lista.update(l => [...l, this.itemSelecionado]); }
    this.view.set('LISTA');
  }

  excluir(item: any) {
    if (confirm(`Tem certeza que deseja excluir o produto "${item.nome}"?`)) {
      this.lista.update(l => l.filter(i => i.id !== item.id));

      // Ajuste de página caso a exclusão deixe a página atual vazia
      if (this.itensPaginados().length === 0 && this.paginaAtual() > 1) {
        this.paginaAtual.update(p => p - 1);
      }
    }
  }

  confirmarExclusao() {
    const item = this.itemParaExcluir();
    if (item) {
      this.lista.update(l => l.filter(i => i.id !== item.id));

      // Ajuste de página se necessário
      if (this.itensPaginados().length === 0 && this.paginaAtual() > 1) {
        this.paginaAtual.update(p => p - 1);
      }
    }
    this.fecharModal();
  }

  fecharModal() {
    this.showModalExcluir.set(false);
    this.itemParaExcluir.set(null);
  }

  prepararExclusao(item: any) {
    this.itemParaExcluir.set(item);
    this.showModalExcluir.set(true);
  }
}
