// auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from './firebase.service';
import { Router } from '@angular/router';
import { GoogleAuthProvider, GithubAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuarioDados: any;

  constructor(
    private firebase: FirebaseService,
    private fireAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.usuarioDados = user;
        localStorage.setItem('user', JSON.stringify(this.usuarioDados));
      } else {
        localStorage.setItem('user', 'null');
      }
    });
  }

  public signIn(email: string, password: string) {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  public signUpWithEmailPassword(email: string, password: string) {
    return this.fireAuth.createUserWithEmailAndPassword(email, password);
  }

  public recoverPassword(email: string) {
    return this.fireAuth.sendPasswordResetEmail(email);
  }

  public signOut() {
    return this.fireAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['signIn']);
    });
  }

  public getUserLogged() {
    const user: any = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null ? user : null;
  }

  public isLoggedIn(): boolean {
    const user: any = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
  }

  public signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return this.fireAuth.signInWithPopup(provider);
  }

  public signInWithGithub() {
    const provider = new GithubAuthProvider();
    return this.fireAuth.signInWithPopup(provider);
  }
}
