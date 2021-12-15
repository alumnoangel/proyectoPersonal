import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { Grafica } from '../grafica';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  document: any = {
    id: "",
    data: {} as Grafica
  };

  id: string = "";
  constructor(private activatedRoute: ActivatedRoute, private FirestoreService: FirestoreService, 
    private alertCtrl: AlertController) { }
  
  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.FirestoreService.consultarPorId("graficas", this.id).subscribe((resultado) => {
      // Preguntar si se hay encontrado un document con ese ID
      if(resultado.payload.data() != null) {
        this.document.id = resultado.payload.id
        this.document.data = resultado.payload.data();
        // Como ejemplo, mostrar el título de la tarea en consola
        console.log(this.document.data.ensamblador);
        console.log(this.document.data);
        console.log(this.id);
      } else {
        // No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
        this.document.data = {} as Grafica;
      } 
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Atención!!',
      message: '¿Desea borrar la tarjeta de la lista?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          handler: () => {
            console.log('Confirm Okay');
            this.clicBotonBorrar();
          }
        }
      ]
    });

    await alert.present();
  }

  clicBotonBorrar() {
    this.FirestoreService.borrar("graficas", this.id).then(() => {
      // Actualizar la lista completa
      this.ngOnInit();
      // Limpiar datos de pantalla
      this.document.data = {} as Grafica;
      this.id = "";
    })
  }
  clicBotonModificar() {
    this.FirestoreService.actualizar("graficas", this.id, this.document.data).then(() => {
      // Actualizar la lista completa
      this.ngOnInit();
      // Limpiar datos de pantalla
      this.document.data = {} as Grafica;
    })
  }
  clicBotonInsertar(){
    this.FirestoreService.insertar("graficas", this.document.data)
    .then(() => {
      this.ngOnInit();
      console.log("Grafica creada correctamente");
      // Limpiar el contenido de la grafica que se estaba editando
      this.document.data = {} as Grafica;
    }, (error) => {
      console.error(error);
    });
  }

}
