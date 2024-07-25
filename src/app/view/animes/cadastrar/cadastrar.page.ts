import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UtilService } from 'src/app/common/util.service';
import { Anime } from 'src/app/model/entities/Anime';
import { AuthService } from 'src/app/model/services/auth.service';
import { FirebaseService } from 'src/app/model/services/firebase.service';

@Component({
  selector: 'app-cadastrar',
  templateUrl: './cadastrar.page.html',
  styleUrls: ['./cadastrar.page.scss'],
})
export class CadastrarPage implements OnInit {
  isInEditarPage: boolean = false;
  anime!: Anime;
  public imagem!: any;
  public user: any;
  formEntidade: FormGroup;
  model: any = {
    nome: '',
    episodios: '',
    genero: '',
    temporada: '',
    studio: '',
    data: ''
  };

  constructor(
    private alertController: AlertController,
    private router: Router,
    private firebaseService: FirebaseService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private utilService: UtilService
  ) {
    this.user = this.auth.getUserLogged();
    this.formEntidade = this.formBuilder.group({
      nome: ['', Validators.required],
      episodios: ['', [Validators.required, Validators.min(1)]],
      genero: ['', Validators.required],
      temporada: [''],
      studio: [''],
      data: ['']
    });
  }

  get errorControl() {
    return this.formEntidade.controls;
  }

  ngOnInit() {
    this.isInEditarPage = false;
  }

  cadastrarImagem(imagem: any) {
    this.imagem = imagem.files;
  }

  cadastrar() {
    if (this.formEntidade.valid) {
      let novo: Anime = new Anime(
        this.formEntidade.value['nome'],
        this.formEntidade.value['episodios'],
        this.formEntidade.value['genero']
      );
      novo.uid = this.user.uid;
      novo.temporada = this.formEntidade.value['temporada'];
      novo.studio = this.formEntidade.value['studio'];
      novo.data = this.formEntidade.value['data'];

      this.utilService.simpleLoader();

      const onSuccess = () => {
        this.utilService.dismissLoader();
        this.utilService.presentAlert("Sucesso", "Anime Cadastrado!");
        this.router.navigate(['/home']);
      };

      const onError = (error: any) => {
        console.error("Erro ao cadastrar anime: ", error);
        this.utilService.dismissLoader();
        this.utilService.presentAlert("Erro", "Falha ao cadastrar!");
      };

      if (this.imagem) {
        this.firebaseService.cadastrarCapa(this.imagem, novo)
          .then(onSuccess)
          .catch(error => {
            console.error("Erro ao cadastrar com imagem: ", error);
            this.utilService.dismissLoader();
            this.utilService.presentAlert("Erro", "Falha ao cadastrar com imagem!");
          });
      } else {
        this.firebaseService.cadastrar(novo)
          .then(onSuccess)
          .catch(onError);
      }
    } else {
      this.utilService.presentAlert("Erro", "Nome, Episódios e Gênero são obrigatórios!");
    }
  }
}
