import { Component } from '@angular/core';
import { Grafica } from '../grafica';
import {FirestoreService} from '../firestore.service';
import {Router} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  graficaEditando: Grafica;
  userEmail: String = "";
  userUID: String = "";
  isLogged: boolean;

  arrayColeccionGraficas: any = [{
    id: "",
    data: {} as Grafica
   }];

  constructor(public loadingCtrl: LoadingController,
    private authService: AuthService,
    private firestoreService: FirestoreService, 
    private router: Router,
    public afAuth: AngularFireAuth
    ) {
    //Crear una grafica vacia al empezar
    this.graficaEditando = {} as Grafica;
    this.obtenerListaGraficas();
  }

  ionViewDidEnter() {
    this.isLogged = false;
    this.afAuth.user.subscribe(user => {
      if(user){
        this.userEmail = user.email;
        this.userUID = user.uid;
        this.isLogged = true;
      }
    })
  }

  login() {
    this.router.navigate(["/login"]);
  }

  logout(){
    this.authService.doLogout()
    .then(res => {
      this.userEmail = "";
      this.userUID = "";
      this.isLogged = false;
      console.log(this.userEmail);
    }, err => console.log(err));
  }

  clicBotonInsertar(){
    this.firestoreService.insertar("graficas", this.graficaEditando)
    .then(() => {
      this.obtenerListaGraficas();
      console.log("Grafica creada correctamente");
      // Limpiar el contenido de la grafica que se estaba editando
      this.graficaEditando = {} as Grafica;
    }, (error) => {
      console.error(error);
    });
  }

  obtenerListaGraficas(){
    this.firestoreService.consultar("graficas").subscribe((resultadoConsultaGraficas) => {
      this.arrayColeccionGraficas = [];
      resultadoConsultaGraficas.forEach((datosGrafica: any) => {
        this.arrayColeccionGraficas.push({
          id: datosGrafica.payload.doc.id,
          data: datosGrafica.payload.doc.data()
        });
      })
    });
  }

  idGraficaSelec: string;

  selecGrafica(graficaSelec) {
    console.log("Grafica seleccionada: ");
    console.log(graficaSelec);
    if(this.isLogged == true){
      this.idGraficaSelec = graficaSelec.id;
      console.log("PROBANDOOOOOOOO "+this.idGraficaSelec);
      this.graficaEditando.marca = graficaSelec.data.marca;
      this.graficaEditando.ensamblador = graficaSelec.data.ensamblador;
      this.graficaEditando.modelo = graficaSelec.data.modelo;
      this.graficaEditando.precio = graficaSelec.data.precio;
      this.graficaEditando.memoria = graficaSelec.data.memoria;
      this.graficaEditando.foto = graficaSelec.data.foto;
      this.router.navigate(['/detalle', this.idGraficaSelec]);
    }
    
  }

  clicBotonBorrar() {
    this.firestoreService.borrar("graficas", this.idGraficaSelec).then(() => {
      // Actualizar la lista completa
      this.obtenerListaGraficas();
      // Limpiar datos de pantalla
      this.graficaEditando = {} as Grafica;
    })
  }
  clicBotonModificar() {
    this.firestoreService.actualizar("graficas", this.idGraficaSelec, this.graficaEditando).then(() => {
      // Actualizar la lista completa
      this.obtenerListaGraficas();
      // Limpiar datos de pantalla
      this.graficaEditando = {} as Grafica;
    })
  }

  clicDetalles() {
    this.router.navigate(['/detalle/nuevo']);
    
  }
  

}
