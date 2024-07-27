import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/common/util.service';
import { Anime } from 'src/app/model/entities/Anime';
import { AuthService } from 'src/app/model/services/auth.service';
import { FirebaseService } from 'src/app/model/services/firebase.service';

@Component({
  selector: 'app-detalhar',
  templateUrl: './detalhar.page.html',
  styleUrls: ['./detalhar.page.scss'],
})
export class DetalharPage implements OnInit {
  isInEditarPage: boolean = true;
  anime!: Anime;
  nome!: string;
  episodios!: number;
  genero!: number;
  temporada!: number;
  studio!: string;
  data!: number;
  edicao: boolean = false;
  public imagem!: any;
  public user!: any;
  formEntidade: FormGroup;
  model: any = {};

  constructor(private alertController: AlertController, private router: Router, private firebaseService: FirebaseService, private auth: AuthService, private formBuilder: FormBuilder, private utilService: UtilService) {
    this.user = this.auth.getUserLogged();
    this.formEntidade = new FormGroup({
      nome: new FormControl,
      episodios: new FormControl,
      genero: new FormControl,
      temporada: new FormControl,
      studio: new FormControl,
      data: new FormControl
    })
  }

  get errorControl() {
    return this.formEntidade.controls;
  }

  ngOnInit() {
    this.anime = history.state.anime;
    this.model = {
      nome: this.anime.nome,
      episodios: this.anime.episodios,
      genero: this.anime.genero,
      temporada: this.anime.temporada,
      studio: this.anime.studio,
      data: this.anime.data
    };
    this.edicao = true;
    console.log(this.anime);
    this.formEntidade = this.formBuilder.group({
      nome: [this.anime.nome, [Validators.required]],
      episodios: [this.anime.episodios, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]],
      genero: [this.anime.genero, [Validators.required]],
      temporada: [this.anime.temporada],
      studio: [this.anime.studio],
      data: [this.anime.data]
    })
  }

  excluir() {
    this.utilService.presentConfirmAlert("Atenção!", "Realmente deseja excluir?");
  }

  cadastrarImagem(imagem: any) {
    this.imagem = imagem.files;
  }

  cadastrar() {
    if (this.formEntidade.valid) {
      this.utilService.simpleLoader();
      
      this.anime.nome = this.formEntidade.value['nome'];
      this.anime.episodios = this.formEntidade.value['episodios'];
      this.anime.genero = this.formEntidade.value['genero'];
      this.anime.temporada = this.formEntidade.value['temporada'];
      this.anime.studio = this.formEntidade.value['studio'];
      this.anime.data = this.formEntidade.value['data'];

      const onSuccess = () => {
        this.utilService.dismissLoader();
        this.utilService.presentAlert("Sucesso", "Anime Editado!");
        this.router.navigate(['/home']);
      };

      const onError = (error: any) => {
        console.error("Erro ao editar anime:", error);
        this.utilService.dismissLoader();
        this.utilService.presentAlert("Erro", "Falha ao editar!");
      };

      if (this.imagem) {
        this.firebaseService.cadastrarCapa(this.imagem, this.anime)
          .then(onSuccess)
          .catch(error => {
            console.error("Erro ao editar com imagem: ", error);
            this.utilService.dismissLoader();
            this.utilService.presentAlert("Erro", "Falha ao editar com imagem!");
          });
      } else {
        console.log("Tentando atualizar o anime:", this.anime); // Log adicional
        this.firebaseService.editarAnime(this.anime, this.anime.id)
          .then(onSuccess)
          .catch(onError);
      }
    } else {
      this.utilService.presentAlert("Erro", "Nome, Episódios e Gênero são obrigatórios!");
    }
  }
}
