import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { Grafica } from '../grafica';
import { AlertController } from '@ionic/angular';
import { LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';

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
  constructor(private activatedRoute: ActivatedRoute, 
    private FirestoreService: FirestoreService, 
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker,) { }
  
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

  async uploadImagePicker(){
    const loading = await this.loadingController.create({
      message: 'Por favor espere...'
    });
    const toast = await this.toastController.create({
      message: 'Imagen subida correctamente',
      duration: 3000
    });
    this.imagePicker.hasReadPermission().then(
      (result) => {
        if(result == false){
          this.imagePicker.requestReadPermission();
        }
        else{
          this.imagePicker.getPictures({
            maximumImagesCount: 1,
            outputType: 1
          }).then(
            (results) => {
              let carpetaImagen = "imagenes";
              for(var i = 0; i < results.length; i++){
                loading.present();
                let nombreImagen = `${new Date().getTime()}`;
                this.FirestoreService.uploadImage(carpetaImagen, nombreImagen, results[i]).then(
                  snapshot => {snapshot.ref.getDownloadURL()
                    .then(downloadURL => {
                      console.log("downloadURL: " + downloadURL);
                      toast.present();
                      loading.dismiss();
                    })
                  })
              }
            },
            (err) => {
              console.log(err)
            }
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async deleteFile(fileURL) {
    const toast = await this.toastController.create({
      message: 'Archivo borrado correctamente',
      duration: 3000
    });
    this.FirestoreService.deleteFileFromURL(fileURL)
    .then(() => {
      toast.present();
    }, (err) => {
      console.log(err);
    });
  }

}
