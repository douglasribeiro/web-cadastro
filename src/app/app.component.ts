import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabService } from './tab.service';
import { ProdutosComponent } from './produtos/produtos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { MusicasComponent } from './musicas/musicas.component';
import { InterpreteComponent } from './interprete/interprete.component';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <aside class="sidebar" [style.width]="tabService.menuAberto() ? '240px' : '60px'">
        <div class="sidebar-header">
          <button (click)="toggleMenu()">☰</button>
          <span *ngIf="tabService.menuAberto()">SISTEMA</span>
        </div>
        <nav class="menu" *ngIf="tabService.menuAberto()">
          <button (click)="tabService.openTab('prod', '📦 Produtos', compProd)">📦 Produtos</button>
          <button (click)="tabService.openTab('cli', '👥 Clientes', compCli)">👥 Clientes</button>
          <button (click)="tabService.openTab('musicas', '🎵 Músicas', compMusica)">
            <span class="icon">🎵</span> Músicas
          </button>
          <button (click)="tabService.openTab('interpretes', '🎵 Intérpretes', compInterprete)">
            <span class="icon">🎵</span> Intérpretes
          </button>
        </nav>
      </aside>

      <main class="main-content">
        <header class="tabs-bar" *ngIf="tabService.tabs().length > 0">
          @for (tab of tabService.tabs(); track tab.id) {
            <div class="tab" [class.active]="tab.id === tabService.activeTabId()" (click)="tabService.activeTabId.set(tab.id)">
              {{ tab.title }}
              <span class="close-btn" (click)="tabService.closeTab(tab.id, $event)">×</span>
            </div>
          }
        </header>
        <section class="viewport">
          @for (tab of tabService.tabs(); track tab.id) {
            <div [hidden]="tab.id !== tabService.activeTabId()">
              <ng-container *ngComponentOutlet="tab.component"></ng-container>
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styleUrl: './app.component.css' // <--- Mudamos de 'styles' para 'styleUrl'
})
export class AppComponent implements OnInit {

  constructor(private readonly keycloak: KeycloakService) {}

  tabService = inject(TabService);
  compProd = ProdutosComponent;
  compCli = ClientesComponent;
  compMusica = MusicasComponent;
  compInterprete = InterpreteComponent;

  toggleMenu() {
    this.tabService.menuAberto.update(v => !v);
  }

  async ngOnInit() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');

  // 1. Verifica se o Keycloak retornou erro de login
  if (error === 'login_required') {
    console.warn('Sessão expirada ou login necessário. Redirecionando...');
    await this.keycloak.login(); // Força o redirecionamento para a tela de login
    return;
  }

  // 2. Verifica se está autenticado
  const authenticated = await this.keycloak.isLoggedIn();

  if (authenticated) {
    // Limpa a URL apenas se houver parâmetros (evita processamento duplicado)
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  } else {
    // Se não está logado e não deu erro, talvez você queira forçar o login aqui
    // await this.keycloak.login();
  }
}

async iniciarLogin() {
    await this.keycloak.login({
      redirectUri: window.location.origin  // Para onde ele volta
    });
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }

  }



