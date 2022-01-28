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

  // Imagen que se va a mostrar en la página
  imagenTempSrc: String;

  subirArchivoImagen: boolean = false;
  borrarArchivoImagen: boolean = false;

  // Nombre de la colección en Firestore Database
  coleccion: String = "EjemploImagenes";

  document: any = {
    id: "",
    data: {} as Grafica
  };

  id: string = "";
  imageURL: String;
  constructor(private activatedRoute: ActivatedRoute, 
    private firestoreService: FirestoreService, 
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker,) {

      this.document.id = "ID_ImagenDePrueba";
      this.obtenerDatosPorID();
     }


  
  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.firestoreService.consultarPorId("graficas", this.id).subscribe((resultado) => {
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
    this.firestoreService.borrar("graficas", this.id).then(() => {
      // Actualizar la lista completa
      this.ngOnInit();
      // Limpiar datos de pantalla
      this.document.data = {} as Grafica;
      this.id = "";
    })
  }
  clicBotonModificar() {
    this.firestoreService.actualizar("graficas", this.id, this.document.data).then(() => {
      // Actualizar la lista completa
      this.ngOnInit();
      // Limpiar datos de pantalla
      this.document.data = {} as Grafica;
    })
  }
  clicBotonInsertar(){
    this.firestoreService.insertar("graficas", this.document.data)
    .then(() => {
      this.ngOnInit();
      console.log("Grafica creada correctamente");
      // Limpiar el contenido de la grafica que se estaba editando
      this.document.data = {} as Grafica;
    }, (error) => {
      console.error(error);
    });
  }

  async obtenerDatosPorID() {    
    this.firestoreService.consultarPorId(this.coleccion, this.document.id).subscribe((resultado) => {
      console.log("Datos iniciales leídos de la BD:");
      console.log(this.document.data.imagenURL);
      // Preguntar si se hay encontrado un document con ese ID
      if(resultado.payload.data() != null) {
        // Guardar los datos obtenidos en la variable document
        this.document.data = resultado.payload.data();
        this.imagenTempSrc = this.document.data.imagenURL;
      } else {
        // No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
        this.document.data = {};
      } 
    });
  }

  async seleccionarImagen() {
    // Comprobar si la aplicación tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permiso de lectura se solicita al usuario
        if(result == false){
          this.imagePicker.requestReadPermission();
        }
        else {
          // Abrir selector de imágenes (ImagePicker)
          this.imagePicker.getPictures({
            maximumImagesCount: 1,  // Permitir sólo 1 imagen
            outputType: 1           // 1 = Base64
          }).then(
            (results) => {  // En la variable results se tienen las imágenes seleccionadas
              if(results.length > 0) { // Si el usuario ha elegido alguna imagen
                this.imagenTempSrc = "data:image/jpeg;base64,"+results[0];
                console.log("Imagen que se ha seleccionado (en Base64): " + this.imagenTempSrc);
                // Se informa que se ha cambiado para que se suba la imagen cuando se actualice la BD
                this.subirArchivoImagen = true;
                this.borrarArchivoImagen = false;
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

  public guardarDatos() {
    if(this.subirArchivoImagen) {

      if(this.document.data.imageURL != null){
        this.eliminarArchivo(this.document.data.imagenURL);
      }

      // Si la imagen es nueva se sube como archivo y se actualiza la BD
      this.subirImagenActualizandoBD();
    } else {
      if(this.borrarArchivoImagen) {
        this.eliminarArchivo(this.document.data.imagenURL);        
        this.document.data.imagenURL = null;
      }
      // Si no ha cambiado la imagen no se sube como archivo, sólo se actualiza la BD
      this.actualizarBaseDatos();
    }
  }

  async subirImagenActualizandoBD(){
    // Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    // Mensaje de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'Image was updated successfully',
      duration: 3000
    });

    // Carpeta del Storage donde se almacenará la imagen
    let nombreCarpeta = "imagenes";

    // Mostrar el mensaje de espera
    loading.present();
    // Asignar el nombre de la imagen en función de la hora actual para
    //  evitar duplicidades de nombres         
    let nombreImagen = `${new Date().getTime()}`;
    // Llamar al método que sube la imagen al Storage
    this.firestoreService.subirImagenBase64(nombreCarpeta, nombreImagen, this.imagenTempSrc)
      .then(snapshot => {
        snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            // En la variable downloadURL se tiene la dirección de descarga de la imagen
            console.log("downloadURL:" + downloadURL);
            //this.document.data.imagenURL = downloadURL;            
            // Mostrar el mensaje de finalización de la subida
            toast.present();
            // Ocultar mensaje de espera
            loading.dismiss();

            // Una vez que se ha termninado la subida de la imagen 
            //    se actualizan los datos en la BD
            this.document.data.imagenURL = downloadURL;
            this.actualizarBaseDatos();
          })
      })    
  } 

  public borrarImagen() {
    // No mostrar ninguna imagen en la página
    this.imagenTempSrc = null;
    // Se informa que no se debe subir ninguna imagen cuando se actualice la BD
    this.subirArchivoImagen = false;
    this.borrarArchivoImagen = true;
  }

  async eliminarArchivo(fileURL) {
    const toast = await this.toastController.create({
      message: 'File was deleted successfully',
      duration: 3000
    });
    this.firestoreService.borrarArchivoPorURL(fileURL)
      .then(() => {
        toast.present();
      }, (err) => {
        console.log(err);
      });
  }

  private actualizarBaseDatos() {    
    console.log("Guardando en la BD: ");
    console.log(this.document.data);
    this.firestoreService.actualizar(this.coleccion, this.document.id, this.document.data);
  }

}
