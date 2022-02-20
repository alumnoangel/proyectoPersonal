import { Component } from '@angular/core';
import { Grafica } from '../grafica';
import {FirestoreService} from '../firestore.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  graficaEditando: Grafica;

  arrayColeccionGraficas: any = [{
    id: "",
    data: {} as Grafica
   }];

  constructor(private firestoreService: FirestoreService, private router: Router) {
    //Crear una grafica vacia al empezar
    this.graficaEditando = {} as Grafica;
    this.obtenerListaGraficas();
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
