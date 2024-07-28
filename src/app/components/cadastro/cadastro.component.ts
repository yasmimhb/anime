import { Component, Input, OnInit, ViewChild, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/common/util.service';
import { AuthService } from 'src/app/model/services/auth.service';
import { FirebaseService } from 'src/app/model/services/firebase.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => CadastroComponent)
  }]
})
export class CadastroComponent implements OnInit, OnChanges {
  @ViewChild('fileInput') fileInput;
  @Input() formEntidade: FormGroup;
  @Input() onSubmit: () => void;
  @Input() onImageChange: (event: any) => void;
  @Input() editar: Boolean;
  @Input() anime: any;
  public user!: any;
  public imageUrl: string | ArrayBuffer | null = null; 
  public imagem: any; 

  constructor(private formBuilder: FormBuilder, private auth: AuthService, private router: Router, private utilService: UtilService, private firebaseService: FirebaseService) {
    this.user = this.auth.getUserLogged();
  }

  ngOnInit() {
    if (this.anime && this.anime.imagemUrl) {
      this.imageUrl = this.anime.imagemUrl;
      console.log('Imagem URL no ngOnInit:', this.imageUrl);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['anime'] && changes['anime'].currentValue && changes['anime'].currentValue.imagemUrl) {
      this.imageUrl = changes['anime'].currentValue.imagemUrl;
      console.log('Imagem URL no ngOnChanges:', this.imageUrl);
    }
  }

  cadastrar() {
    if (this.onSubmit) {
      this.onSubmit();
    }
  }

  excluir() {
    this.utilService.presentConfirmAlert("Atenção!", "Realmente deseja excluir?");
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

  cancelar() {
    this.formEntidade.reset();
    this.imageUrl = null; 
    this.router.navigate(['/home']);
  }

  onFileInputClick() {
    this.fileInput.nativeElement.click();
  }
}
