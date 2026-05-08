import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-wrapper">
      <header class="page-header">
        <h2>{{ view() === 'LISTA' ? '📦 Produtos' : '📝 Editando Produto' }}</h2>
        @if (view() === 'LISTA') {
          <button class="btn-main" (click)="novo()">+ Novo Item</button>
        }
      </header>

      @if (view() === 'LISTA') {
        <table class="data-table">
          <thead><tr><th>ID</th><th>Nome</th><th>Ação</th></tr></thead>
          <tbody>
            @for (p of lista(); track p.id) {
              <tr>
                <td>{{ p.id }}</td>
                <td>{{ p.nome }}</td>
                <td><button class="btn-outline" (click)="editar(p)">Editar</button></td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="form-box">
          <input [(ngModel)]="itemSelecionado.nome" placeholder="Nome do produto">
          <div class="form-btns">
            <button class="btn-save" (click)="salvar()">Salvar</button>
            <button (click)="view.set('LISTA')">Cancelar</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .btn-main { background: #2c3e50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #eee; }
    .data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
    .btn-outline { border: 1px solid #3498db; color: #3498db; background: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
    .form-box { max-width: 400px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: white; display: flex; flex-direction: column; gap: 15px; }
    .form-box input { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .btn-save { background: #27ae60; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; }
  `]
})
export class ProdutosComponent {
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  lista = signal([{ id: 1, nome: 'Mouse' }, { id: 2, nome: 'Teclado' }]);
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
}
