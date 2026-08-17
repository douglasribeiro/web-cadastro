import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ErrorInterceptor } from '../../errorInterceptor';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NaturezaContabil, PlanoContas, TipoContaContabil } from './plano-coontas';
import { PlanoContasService } from './plano-contas.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-plano-contas',
 imports: [CommonModule, FormsModule, MatIconModule, NgxMaskDirective, NgxMaskPipe],
  templateUrl: './plano-contas.component.html',
  styleUrl: '../../app.component.css',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideNgxMask(),
  ],
})
export class PlanoContasComponent implements OnInit {

  private readonly service = inject(PlanoContasService);
  public planoContas = signal<PlanoContas[]>([]);
  public carregando = signal<boolean>(true);
  termoBusca = signal('');
  paginaAtual = signal(1);
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  situacao = signal<'INCLUSÃO' | 'ALTERAÇÃO' | 'NEUTRO'>('NEUTRO');
  itensPorPagina = signal(5);
  itemSelecionado: Partial<PlanoContas> = {};
  itemParaExcluir = signal<PlanoContas | null>(null);
  showModalExcluir = signal(false);
  showModalSucesso = signal(false);
  showModalStd = signal(false);
  mensagemStd = signal('');
  mensagemHeadStd = signal('');
  naturezaConta = Object.values(NaturezaContabil).filter(v => typeof v === 'string');
  naturezaContaEnun = this.naturezaConta;
  tipoContaContabil = Object.values(TipoContaContabil).filter(v => typeof v === 'string');
  tipoContaContabilEnun = this.tipoContaContabil;

  ngOnInit(): void {
    this.view.set('LISTA');
    this.situacao.set('NEUTRO');
    this.carregarLista();
  }

  nomesNatureza: Record<string, string> = {
    ['DEBITO']: 'Debito',
    ['CREDITO']: 'Credito'
  }

  nomesAmigaveis: Record<string, string> = {
    ['ATIVO']: 'Ativo',
    ['PASSIVO']: 'Passivo',
    ['RECEITA']: 'Receita',
    ['DESPESA']: 'Despesa'
  };

  compararTipos(tipo1: any, tipo2: any): boolean {
  // Se ambos forem nulos ou indefinidos, são iguais
  console.log(tipo1 + '-----' + tipo2)
  if (!tipo1 || !tipo2) {
    return tipo1 === tipo2;
  }

  // Se forem strings simples (ex: 'SINTETICA' e 'sintetica')
  const str1 = String(tipo1).toLowerCase();
  const str2 = String(tipo2).toLowerCase();
  return str1 === str2;
}

  tipoSelecionado = {
    tipo: ''
  }

  filtrar(v: any) {
    this.termoBusca.set(v);
    this.paginaAtual.set(1);
  }

  novo(){
    this.itemSelecionado = {
      id: 0,
      codigoEstrutural: '',
      descricao: '',
      tipo: null,
      natureza: null,
      nivel: 0,
      analitica: null
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
    return this.planoContas().filter((m) => m.descricao.toLowerCase().includes(busca));
  });



  editar(reg: PlanoContas) {
    this.cargaPlanoContas();
    console.log('Metodo Editar.');
    this.itemSelecionado = { ...reg };
    //this.tipoSelecionado.tipo = this.itemSelecionado.tipo;
    this.view.set('EDICAO');
    this.situacao.set('ALTERAÇÃO');
  }

  cargaPlanoContas(): void {
    this.planoContas.set([]);
    this.service.getList().subscribe({
      next: (dados: any) => {
        console.log(dados.data);
        this.planoContas.set(dados.data);

        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar Bancos', err);
        this.carregando.set(false);
      },
    });
  }

  prepararExclusao(m: PlanoContas) {
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

  salvar() {
    const dadosParaSalvar = this.itemSelecionado as PlanoContas;
    if (this.situacao() === 'INCLUSÃO' && this.validaConta(dadosParaSalvar)) {
      if(Number(dadosParaSalvar.codigoEstrutural.substring(5, 8)) === 0) {
        dadosParaSalvar.analitica = false;
      } else {
        dadosParaSalvar.analitica = true;
      }
      dadosParaSalvar.nivel = this.nivelConta(dadosParaSalvar);
      this.service.salvar(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Salvo com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao salvar:', err),
      });
    } else if(this.situacao() !== 'INCLUSÃO' && this.validaConta(dadosParaSalvar)) {
      this.service.alterar(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log('Alterado com sucesso!', res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
          this.view.set('LISTA');
        },
        error: (err) => console.error('Erro ao editar:', err),
      });
    }
  }
/*
  private validaContaT(conta: PlanoContas): boolean{
    const nvl1 = String(conta.codigoEstrutural.substring(0,1)).toLowerCase();
    const nvl2 = String(conta.codigoEstrutural.substring(1,2)).toLowerCase();
    const nvl3 = String(conta.codigoEstrutural.substring(2,3)).toLowerCase();
    const nvl4 = String(conta.codigoEstrutural.substring(3,5)).toLowerCase();
    const nvl5 = String(conta.codigoEstrutural.substring(5,8)).toLowerCase();
    if( nvl1 == '0' ){
      return false;
    }
    if( nvl1 != '0' && nvl2 == '0' && (nvl3 != '0' || nvl4 != '00' || nvl5 != '000') ){
      return false;
    }
    if( nvl1 != '0' && nvl2 != '0' && nvl3 == '0' &&( nvl4 != '00' || nvl5 != '000') ){
      return false;
    }
    if( nvl1 != '0' && nvl2 != '0' && nvl3 != '0' && nvl4 == '00' &&  nvl5 != '000' ){
      return false;
    }
    return true;
  }
*/
  private validaConta(conta: PlanoContas): boolean {
    const cod = conta.codigoEstrutural;

    // 1. Validação básica de existência e tamanho (deve ter exatamente 8 dígitos)
    if (!cod || cod.length !== 8) return false;

    // 2. Extrai os blocos diretamente como strings limpas
    const nvl1 = cod.charAt(0);
    const nvl2 = cod.charAt(1);
    const nvl3 = cod.charAt(2);
    const nvl4 = cod.substring(3, 5);
    const nvl5 = cod.substring(5, 8);

    // Regra 1: O primeiro dígito nunca pode ser zero
    if (nvl1 === '0') return false;

    // Regra 2: Se o nível 2 for zero, todos os seguintes DEVEM ser zero
    if (nvl2 === '0' && (nvl3 !== '0' || nvl4 !== '00' || nvl5 !== '000')) return false;

    // Regra 3: Se o nível 3 for zero, os seguintes DEVEM ser zero
    if (nvl3 === '0' && (nvl4 !== '00' || nvl5 !== '000')) return false;

    // Regra 4: Se o nível 4 for zero, o nível 5 DEVE ser zero
    if (nvl4 === '00' && nvl5 !== '000') return false;

    return true;
  }

  private nivelConta(conta: PlanoContas): number {
    const cod = conta.codigoEstrutural;

    // Se o código for inválido ou menor que o tamanho esperado (8 dígitos)
    if (!cod || cod.length < 8) return 0;

    // Valida de trás para frente usando fatias exatas da string
    if (cod.substring(5, 8) !== '000') return 5;
    if (cod.substring(3, 5) !== '00')  return 4;
    if (cod.charAt(2) !== '0')          return 3;
    if (cod.charAt(1) !== '0')          return 2;
    if (cod.charAt(0) !== '0')          return 1;

    return 0; // Caso base de segurança (ex: tudo zero '00000000')
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
        this.planoContas.set(dados.data);
        console.log(this.planoContas[0]);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao listar Cartões', err);
        this.carregando.set(false);
      },
    });
  }

  fecharModal() {
    this.showModalExcluir.set(false);
    this.itemParaExcluir.set(null);
  }

  fecharSucesso() {
    this.showModalSucesso.set(false);
    this.situacao.set('NEUTRO');
  }

  confirmarExclusao() {
    this.planoContas.update((l) =>
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

