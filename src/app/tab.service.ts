import { Injectable, signal, Type } from '@angular/core';

export interface Tab {
  id: string;
  title: string;
  component: Type<any>;
}

@Injectable({ providedIn: 'root' })
export class TabService {
  tabs = signal<Tab[]>([]);
  activeTabId = signal<string | null>(null);
  menuAberto = signal(true);

  openTab(id: string, title: string, component: Type<any>) {
    if (!this.tabs().find(t => t.id === id)) {
      this.tabs.update(tabs => [...tabs, { id, title, component }]);
    }
    this.activeTabId.set(id);
  }

  closeTab(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.tabs.update(tabs => tabs.filter(t => t.id !== id));
    const restantes = this.tabs();
    if (this.activeTabId() === id && restantes.length > 0) {
      this.activeTabId.set(restantes[restantes.length - 1].id);
    } else if (restantes.length === 0) {
      this.activeTabId.set(null);
    }
  }
}
