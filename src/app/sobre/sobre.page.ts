import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import * as L from 'leaflet';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
})
export class SobrePage implements OnInit {

  map: L.Map;
  newMarker:any;
  address:string[];

  constructor(private callNumber: CallNumber) { }

  ngOnInit() {
  }

   llamar() {
    this.callNumber.callNumber("674586553", true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => console.log('Error launching dialer', err));
  }

  ionViewDidEnter(){
    this.loadMap();
  }

  loadMap() {
    let latitud = 36.6797047;
    let longitud = -5.4470656;
    let zoom = 17;
    this.map = L.map("mapId").setView([latitud, longitud], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(this.map);
  }

}
