import { ErrorInterceptor } from './../errorInterceptor';
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicasService } from './musicas.service';
import { Musica } from './musica';
import { HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { InterpreteService } from '../interprete/interprete.service';
import { GravadoraService } from '../gravadora/gravadora.service';
import { GeneroService } from '../genero/genero.service';
declare var jsmediatags: any;

export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  errors: string[]; // Aqui estão as mensagens que você definiu no Java
}

@Component({
  selector: 'app-musicas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'musicas.component.html',
  styleUrl: '../app.component.css',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class MusicasComponent implements OnInit {
  private musicaService = inject(MusicasService);
  private interpreteService = inject(InterpreteService);
  private gravadoraService = inject(GravadoraService);
  private generoService = inject(GeneroService);
  view = signal<'LISTA' | 'EDICAO'>('LISTA');
  situacao = signal<'INCLUSÃO' | 'ALTERAÇÃO' | 'NEUTRO'>('NEUTRO');
  nomeArquivoSelecionado = signal<string | null>(null);
  termoBusca = signal('');
  paginaAtual = signal(1);
  itensPorPagina = signal(5);
  totalRegistros = signal(0); // Exemplo de valor vindo do backend
  public musicas = signal<Musica[]>([]);
  public carregando = signal<boolean>(true);
  showModalExcluir = signal(false);
  showModalSucesso = signal(false);
  showModalErro = signal(false);
  showModalStd = signal(false);
  mensagemErro = signal('');
  mensagemStd = signal('');
  mensagemHeadStd = signal('');
  itemParaExcluir = signal<Musica | null>(null);
  itemSelecionado: Partial<Musica> = {};
  compMusica = MusicasComponent;
  listaInterprete = signal<{ id: number; nome: string }[]>([]);
  listagravadora = signal<{ id: number; nome: string }[]>([]);
  listaGenero = signal<{ id: number; nome: string }[]>([]);
  keycloak: any;

  async ngOnInit(): Promise<void> {
    this.carregarInterprete();
    this.carregaGravadora();
    this.carregaGenero();
    this.carregarMusicas();
  }

  carregarInterprete() {
    this.listaInterprete.set(null);
    this.interpreteService.getList().subscribe((obj: any) => {
      this.listaInterprete.set(obj.data);
    });
  }

  carregaGravadora() {
    this.listagravadora.set(null);
    this.gravadoraService.getList().subscribe((obj: any) => {
      this.listagravadora.set(obj.data);
    });
  }

  carregaGenero() {
    this.listaGenero.set(null);
    this.generoService.getList().subscribe((obj: any) => {
      this.listaGenero.set(obj.data);
    });
  }

  // Lógica de Filtro e Busca
  listaFiltrada = computed(() => {
    const busca = this.termoBusca().toLowerCase();
    return this.musicas().filter(
      (m) =>
        m.nome.toLowerCase().includes(busca) ||
        m.interprete.nome.toLowerCase().includes(busca),
    );
  });

  totalPaginas = computed(
    () => Math.ceil(this.listaFiltrada().length / this.itensPorPagina()) || 1,
  );

  itensPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina();
    return this.listaFiltrada().slice(inicio, inicio + this.itensPorPagina());
  });

  // Funções de Controle
  filtrar(v: string) {
    this.termoBusca.set(v);
    this.paginaAtual.set(1);
  }

  //mudarPagina(d: number) {
  //  this.paginaAtual.update((p) => p + d);
  //}

  //mudarLimite(l: string) {
  //  this.itensPorPagina.set(Number(l));
  //  this.paginaAtual.set(1);
 // }

  // CRUD
  //itemSelecionado: Partial<Musica>;
  novo() {
    this.carregarInterprete();
    this.carregaGravadora();
    this.carregaGenero();
    this.itemSelecionado = {
      id: 0,
      nome: '',
      interprete: {
        nome: '',
        id: 0,
        genero: '',
        origem: '',
        desde: '',
        sobre: '',
      },
      gravadora: { id: 0, nome: '' },
      genero: { id: 0, nome: '' },
      album: '',
      lancamento: '',
    };
    this.view.set('EDICAO');
    this.situacao.set('INCLUSÃO');
  }

  editar(m: Musica) {
    this.carregarInterprete();
    this.carregaGravadora();
    this.carregaGenero();
    this.itemSelecionado = { ...m };
    this.view.set('EDICAO');
    this.situacao.set('ALTERAÇÃO');
  }

  salvar() {
    const dadosParaSalvar = this.itemSelecionado as Musica;
    if (this.situacao() === 'INCLUSÃO') {
      this.musicaService.salvarMusica(dadosParaSalvar).subscribe({
        next: (res) => {
          console.log(res);
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
        },
        error: (err) => {
          let msgFinal = 'Erro desconhecido no servidor.';
          const corpo = err.error;

          if (corpo) {
            if (Array.isArray(corpo)) {
              msgFinal = corpo.join('\n');
              this.mensagemErro.set(msgFinal);
              this.showModalErro.set(true);
            } else {
              msgFinal =
                corpo.message || (typeof corpo === 'string' ? corpo : msgFinal);
            }
          }
          if (corpo.errors && Array.isArray(corpo.errors)) {
            corpo.errors.forEach((msg, i) => {
              console.log(`Erro ${i + 1}:`, msg);
            });
            msgFinal = corpo.errors[0]; // Pega o primeiro para exibir na UI
            this.mensagemErro.set(msgFinal);
            this.showModalErro.set(true);
          }
        },
      });
    } else {
      this.musicaService.alterarMusica(dadosParaSalvar).subscribe({
        next: (res) => {
          this.finalizarOperacao(); // Chama a limpeza após o sucesso
        },
        error: (err) => console.error('Erro ao editar:', err),
      });
    }
  }

  private finalizarOperacao() {
    this.showModalSucesso.set(true);
    this.situacao.set('NEUTRO');
    this.carregarMusicas();
  }

  prepararExclusao(m: Musica) {
    this.itemParaExcluir.set(m);
    this.showModalExcluir.set(true);
  }

  confirmarExclusao() {
    this.musicas.update((l) =>
      l.filter((i) => i.id !== this.itemParaExcluir()?.id),
    );
    if (this.itensPaginados().length === 0 && this.paginaAtual() > 1)
      this.paginaAtual.update((p) => p - 1);
    this.musicaService.excluir(this.itemParaExcluir()?.id).subscribe({
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

  fecharModal() {
    this.showModalExcluir.set(false);
    this.itemParaExcluir.set(null);
  }

  carregarMusicas(): void {
    this.view.set('LISTA');
    this.musicaService.getList().subscribe({
      next: (dados: any) => {
        this.totalRegistros.set(dados.length);
        this.musicas.set(dados.data);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
      },
    });
  }

  // inclusão para pesquisa de artista

  focandoArtista = signal(false);

  artistasConhecidos = signal([
    'Queen',
    'Pink Floyd',
    'The Beatles',
    'AC/DC',
    'Led Zeppelin',
  ]);

  // 2. Sinal para controlar o que aparece no dropdown
  sugestoesArtistas = signal<string[]>([]);

  // 3. Controle de visibilidade do dropdown
  exibirSugestoes = signal(false);

  // 4. O MÉTODO QUE ESTÁ FALTANDO:
  filtrarArtistasExistentes(event: any) {
    const termo = event.target.value.toLowerCase();
    this.exibirSugestoes.set(true);

    if (!termo) {
      this.sugestoesArtistas.set([]);
      return;
    }

    const filtrados = this.artistasConhecidos().filter((a) =>
      a.toLowerCase().includes(termo),
    );

    this.sugestoesArtistas.set(filtrados);
  }

  // 5. Método para selecionar da lista
  selecionarArtista(nome: string) {
    this.itemSelecionado.nome = nome;
    this.focandoArtista.set(false); // Fecha a lista imediatamente ao selecionar
  }

  fecharSugestoes() {
    // O delay de 200ms é essencial para o (mousedown) do item da lista ser registrado antes da lista sumir
    setTimeout(() => {
      this.focandoArtista.set(false);
    }, 200);
  }

  abrirSugestoes() {
    this.focandoArtista.set(true);
    const termo = (this.itemSelecionado.nome || '').toLowerCase();
    const filtrados = this.artistasConhecidos().filter((a) =>
      a.toLowerCase().includes(termo),
    );
    this.sugestoesArtistas.set(filtrados);
  }

  cancelar() {
    this.view.set('LISTA');
    this.situacao.set('NEUTRO');
    this.carregarMusicas();
  }

  private extrairTexto(tag: any): string {
    if (!tag) return '';
    // Se for um objeto (TagFrame), pega a propriedade 'data' (que pode ser string ou conter .text)
    if (typeof tag === 'object') {
      return tag.data?.text || tag.data || '';
    }
    return String(tag);
  }

  aoSelecionarArquivo(event: any) {
    const reader = (window as any).jsmediatags;
    const arquivo = event.target.files[0]; // Pega o primeiro arquivo
    if (!arquivo) return;

    this.nomeArquivoSelecionado.set(arquivo.name);

    const jmt = (window as any).jsmediatags;

    if (!jmt) {
      alert(
        'Erro: A biblioteca de leitura de música ainda não carregou. Tente novamente em instantes.',
      );
      console.error('jsmediatags is undefined on window object');
      return;
    }

    // 1. Captura a Duração Real (Browser)
    const audio = new Audio();
    audio.src = URL.createObjectURL(arquivo);
    audio.onloadedmetadata = () => {
      // Converte para BigInt (segundos) para seu modelo
      this.itemSelecionado.duracaoSegundos = BigInt(Math.round(audio.duration));
      URL.revokeObjectURL(audio.src);
    };

    if (!reader) {
      console.error('A biblioteca jsmediatags não foi carregada no index.html');
      return;
    }

    // 2. Captura Metadados via jsmediatags
    jmt.read(arquivo, {
      onSuccess: (tag) => {
        const tags = tag.tags;
        console.log(tags);
        // Mapeamento completo de todos os campos
        this.itemSelecionado.nome =
          this.extrairTexto(tags.title) ||
          arquivo.name.replace(/\.[^/.]+$/, '');
        this.itemSelecionado.nome = this.itemSelecionado.nome
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        this.itemSelecionado.interprete.nome = this.extrairTexto(tags.artist)
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        this.itemSelecionado.album = this.extrairTexto(tags.album)
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        this.itemSelecionado.lancamento = this.extrairTexto(tags.year);
        this.itemSelecionado.genero.nome = this.extrairTexto(tags.genre)
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        this.itemSelecionado.compositor = this.extrairTexto(tags.composer); // Agora habilitado
        this.itemSelecionado.caminhoArquivo = arquivo.name;

        // Define valores padrão para campos numéricos se estiverem vazios
        this.itemSelecionado.intervalo = 0;
        this.itemSelecionado.introducao = 0n;

        // 3. Extração da Capa (Conversão para Base64)
        if (tags.picture) {
          const { data, format } = tags.picture;
          let base64String = '';
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          // Atribui a imagem para o campo capa do modelo
          //this.itemSelecionado.capa = `data:${format};base64,${btoa(base64String)}`;
        }
      },
      onError: (error) => {
        console.error('Erro ao ler tags:', error);
        this.itemSelecionado.nome = arquivo.name.replace(/\.[^/.]+$/, '');
      },
    });

    // Cálculos Reativos
    this.totalPaginas = computed(
      () => Math.ceil(this.totalRegistros() / this.itensPorPagina()) || 1,
    );
  }

  mudarPagina(delta: number) {
    this.irParaPagina(this.paginaAtual() + delta);
  }

  mudarLimite(novoLimite: any) {
    this.itensPorPagina.set(Number(novoLimite));
    this.paginaAtual.set(1);
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
    }
  }

  primeiroRegistro = computed(() => {
    if (this.totalRegistros() === 0) return 0;
    return (this.paginaAtual() - 1) * this.itensPorPagina() + 1;
  });

  ultimoRegistro = computed(() => {
    const limite = this.paginaAtual() * this.itensPorPagina();
    return Math.min(limite, this.totalRegistros());
  });

  fecharSucesso() {
    this.showModalSucesso.set(false);
    this.situacao.set('NEUTRO');
  }

  fecharErro() {
    this.showModalErro.set(false);
  }

  fecharStd() {
    this.showModalStd.set(false);
  }
}
function carregaGravadora() {
  throw new Error('Function not implemented.');
}
