import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { TabService } from './tab.service';
import { ProdutosComponent } from './produtos/produtos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { MusicasComponent } from './musicas/musicas.component';

// Importações do Lucide Icons
import {
  LucideAngularModule,
  Folder,
  Package,
  Users,
  Disc,
  Music,
  Mic,
  ChevronDown,
  ChevronUp,
  CreditCard,
  BanknoteArrowDown,
  Banknote,
  ShoppingCart
} from 'lucide-angular';
import { InterpreteComponent } from './interprete/interprete.component';
import { BancoComponent } from './financeiro/banco/banco.component';

interface SubMenuItem {
  id: string;
  label: string;
  icon: any; // Armazena a referência do componente do ícone
  component: any;
}

interface MenuItem {
  label: string;
  icon: any; // Armazena a referência do componente do ícone
  id?: string;
  component?: any;
  subItems?: SubMenuItem[];
  aberto?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  // Adicionado LucideAngularModule aos imports
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="app-container">
      <aside class="sidebar" [style.width]="tabService.menuAberto() ? '240px' : '60px'">
        <div class="sidebar-header">
          <button (click)="toggleMenu()">☰</button>
          <span *ngIf="tabService.menuAberto()">SISTEMA</span>
        </div>

        <nav class="menu" *ngIf="tabService.menuAberto()">
          @for (item of menuItems; track item.label) {
            <div>
              <!-- Item Pai -->
              <button class="menu-item" (click)="selecionarItem(item)">
                <lucide-icon [name]="item.icon" class="icon"></lucide-icon>
                <span class="label">{{ item.label }}</span>
                <span class="arrow" *ngIf="item.subItems">
                  <lucide-icon [name]="item.aberto ? iconUp : iconDown"></lucide-icon>
                </span>
              </button>

              <!-- Submenu -->
              @if (item.subItems && item.aberto) {
                <div class="submenu">
                  @for (sub of item.subItems; track sub.id) {
                    <button class="submenu-item" (click)="tabService.openTab(sub.id, sub.label, sub.component)">
                      <lucide-icon [name]="sub.icon" class="icon sub-icon"></lucide-icon>
                      <span class="label">{{ sub.label }}</span>
                    </button>
                  }
                </div>
              }
            </div>
          }
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
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly keycloak = inject(KeycloakService);
  tabService = inject(TabService);

  // Atalhos para as setas de controle
  iconDown = ChevronDown;
  iconUp = ChevronUp;

  // Estrutura de dados com os componentes de ícones do Lucide
  menuItems: MenuItem[] = [
    {
      label: 'Cadastros',
      icon: Folder,
      aberto: false,
      subItems: [
        { id: 'prod', label: 'Produtos', icon: Package, component: ProdutosComponent },
        { id: 'cli', label: 'Clientes', icon: Users, component: ClientesComponent },
        { id: 'ban', label: 'Bancos', icon: Banknote, component: BancoComponent },
        { id: 'cartao', label: 'Cartão', icon: CreditCard, component: MusicasComponent },
      ]
    },
    {
      label: 'Músicas e Mídia',
      icon: Music, // Ícone de Vinil/CD para a categoria principal
      aberto: false,
      subItems: [
        { id: 'musicas', label: 'Músicas', icon: Music, component: MusicasComponent }, // Ícone de Nota Musical
        { id: 'interpretes', label: 'Intérpretes', icon: Mic, component: InterpreteComponent } // Ícone de Microfone
      ]
    },
    {
      label: 'Financeiro',
      icon: Banknote, // Ícone de Vinil/CD para a categoria principal
      aberto: false,
      subItems: [
        { id: 'pagar', label: 'Pagar', icon: BanknoteArrowDown, component: InterpreteComponent }, // Ícone de Microfone
        { id: 'compra', label: 'Compra', icon: ShoppingCart, component: InterpreteComponent }, // Ícone de Microfone
        { id: 'receber', label: 'Receber', icon: PaymentResponse, component: MusicasComponent }
      ]
    }
  ];

  toggleMenu() {
    this.tabService.menuAberto.update(v => !v);
  }

  selecionarItem(item: MenuItem) {
    if (item.subItems) {
      item.aberto = !item.aberto;
    } else if (item.id && item.component) {
      this.tabService.openTab(item.id, item.label, item.component);
    }
  }

  async ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error === 'login_required') {
      console.warn('Sessão expirada ou login necessário. Redirecionando...');
      await this.keycloak.login();
      return;
    }

    const authenticated = await this.keycloak.isLoggedIn();
    if (authenticated) {
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }

  async iniciarLogin() {
    await this.keycloak.login({ redirectUri: window.location.origin });
  }

  logout() {
    this.keycloak.logout(window.location.origin);
  }
}
