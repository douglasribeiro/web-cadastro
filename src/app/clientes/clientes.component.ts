import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-wrapper">
      <header class="page-header">
        <h2>{{ view() === 'LISTA' ? '👥 Cadastro de Clientes' : '📝 Editando Cliente' }}</h2>
        @if (view() === 'LISTA') {
          <button class="btn-main" (click)="novo()">+ Novo Cliente</button>
        }
      </header>

      @if (view() === 'LISTA') {
        <table class="data-table">
          <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Ação</th></tr></thead>
          <tbody>
            @for (c of lista(); track c.id) {
              <tr>
                <td>{{ c.id }}</td>
                <td>{{ c.nome }}</td>
                <td>{{ c.email }}</td>
                <td><button class="btn-outline" (click)="editar(c)">Editar</button></td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="form-box">
          <div class="form-group">
            <label>Nome do Cliente</label>
            <input [(ngModel)]="itemSelecionado.nome" placeholder="Digite o nome do produto...">
          </div>

          <div class="form-group">
            <label>E-mail</label>
            <input type="number" [(ngModel)]="itemSelecionado.email" placeholder="fulano@email.com">
          </div>

          <div class="form-btns">
            <button class="btn-save" (click)="salvar()">Gravar Alterações</button>
            <button class="btn-cancel" (click)="view.set('LISTA')">Cancelar</button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['../app.component.css'] // Reutilizando estilos globais se preferir

})
export class ClientesComponent {
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  lista = signal([{ id: 1, nome: 'Ana Costa', email: 'ana@teste.com' }]);
  itemSelecionado: any;

  novo() { this.itemSelecionado = { id: Date.now(), nome: '', email: '' }; this.view.set('EDICAO'); }
  editar(item: any) { this.itemSelecionado = { ...item }; this.view.set('EDICAO'); }
  salvar() {
    const idx = this.lista().findIndex(i => i.id === this.itemSelecionado.id);
    if (idx !== -1) {
      const n = [...this.lista()]; n[idx] = this.itemSelecionado; this.lista.set(n);
    } else { this.lista.update(l => [...l, this.itemSelecionado]); }
    this.view.set('LISTA');
  }
}
