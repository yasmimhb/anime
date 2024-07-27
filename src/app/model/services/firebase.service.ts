import { Injectable } from '@angular/core';
import { Anime } from '../entities/Anime';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FirebaseService {
  private PATH : string = 'Animes';

  constructor(private angularFirestore: AngularFirestore, private storage : AngularFireStorage) { }

  buscarTodos(uid: String){
    return this.angularFirestore.collection(this.PATH, ref => ref.where('uid', '==', uid)).snapshotChanges();
  }

  cadastrar(anime : Anime){
    return this.angularFirestore.collection(this.PATH).add({nome: anime.nome, 
      episodios: anime.episodios, 
      genero: anime.genero,
      temporada: anime.temporada || null,
      studio: anime.studio || null,
      data: anime.data || null, 
      uid: anime.uid});
  }

  cadastrarComCapa(anime : Anime){
    return this.angularFirestore.collection(this.PATH).add({nome: anime.nome, 
      episodios: anime.episodios, 
      genero: anime.genero,
      temporada: anime.temporada || null,
      studio: anime.studio || null,
      data: anime.data || null,
      downloadURL: anime.downloadURL || null, 
      uid: anime.uid});
  }  

  editarAnime(anime: Anime, id: string){
    return this.angularFirestore.collection(this.PATH).doc(id)
    .update({
      nome: anime.nome,
      episodios: anime.episodios,
      genero: anime.genero,
      temporada: anime.temporada || null,
      studio: anime.studio || null,
      data: anime.data || null, 
      uid: anime.uid
    })
  }
  
  editarComCapa(anime: Anime, id: string){
    return this.angularFirestore.collection(this.PATH).doc(id)
    .update({
      nome: anime.nome,
      episodios: anime.episodios,
      genero: anime.genero,
      temporada: anime.temporada || null,
      studio: anime.studio || null,
      data: anime.data || null,
      downloadURL: anime.downloadURL || null, 
      uid: anime.uid
    })
  }

  excluirAnime(anime: Anime){
    return this.angularFirestore.collection(this.PATH)
    .doc(anime.id)
    .delete()
  }

  cadastrarCapa(imagem: any, anime: Anime) {
    return new Promise((resolve, reject) => {
      const file = imagem.item(0);
      if (file.type.split('/')[0] !== 'image') {
        console.error('Tipo não suportado!');
        reject('Tipo não suportado!');
        return;
      }
      const path = `images/${anime.nome}_${file.name}`;
      const fileRef = this.storage.ref(path);
      const task = this.storage.upload(path, file);
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(resp => {
            anime.downloadURL = resp;
            if (!anime.id) {
              this.cadastrarComCapa(anime).then(resolve).catch(reject);
            } else {
              this.editarComCapa(anime, anime.id).then(resolve).catch(reject);
            }
          }, error => {
            reject(error);
          });
        })
      ).subscribe();
    });
  }
}	