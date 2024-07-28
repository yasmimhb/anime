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
  edicao: boolean = false;
  downloadURL!: string;
  user: any;
  formEntidade: FormGroup;
  model: any = {};
  imageUrl: string | ArrayBuffer | null = null; 
  imagem: any;

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
      nome: new FormControl('', [Validators.required]),
      episodios: new FormControl('', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]),
      genero: new FormControl('', [Validators.required]),
      temporada: new FormControl(''),
      studio: new FormControl(''),
      data: new FormControl('')
    });
  }

  get errorControl() {
    return this.formEntidade.controls;
  }

  ngOnInit() {
    if (history.state.anime) {
      this.anime = history.state.anime;
      this.model = { ...this.anime };
      this.edicao = true;

      this.formEntidade.patchValue({
        nome: this.anime.nome,
        episodios: this.anime.episodios,
        genero: this.anime.genero,
        temporada: this.anime.temporada,
        studio: this.anime.studio,
        data: this.anime.data
      });

      this.downloadURL = this.anime.downloadURL;
    }
  }

  cadastrarImagem(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imagem = input.files;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  async cadastrar() {
    if (this.formEntidade.valid) {
      this.utilService.simpleLoader();

      const novoAnime = { ...this.anime, ...this.formEntidade.value };

      try {
        if (this.imagem) {
          await this.firebaseService.cadastrarCapa(this.imagem, novoAnime);
        } else {
          await this.firebaseService.cadastrar(novoAnime);
        }

        this.utilService.dismissLoader();
        this.utilService.presentAlert("Sucesso", "Anime Editado!");
        this.router.navigate(['/home']);
      } catch (error) {
        console.error("Erro ao editar anime:", error);
        this.utilService.dismissLoader();
        this.utilService.presentAlert("Erro", "Falha ao editar!");
      }
    } else {
      this.utilService.presentAlert("Erro", "Nome, Episódios e Gênero são obrigatórios!");
    }
  }
}
