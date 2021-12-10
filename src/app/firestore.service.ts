import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private angularFirestore: AngularFirestore) { }
  
  public insertar(coleccion, datos) {
    return this.angularFirestore.collection(coleccion).add(datos);
  }
  public consultar(coleccion) {
    return this.angularFirestore.collection(coleccion).snapshotChanges();
  }
  public borrar(coleccion, documentId) {
    return this.angularFirestore.collection(coleccion).doc(documentId).delete();
  }
  public actualizar(coleccion, documentId, datos) {
    return this.angularFirestore.collection(coleccion).doc(documentId).set(datos);
  }
  public consultarPorId(coleccion, documentId){
    return this.angularFirestore.collection(coleccion).doc(documentId).snapshotChanges();
  }
}


