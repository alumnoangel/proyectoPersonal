import { Component, OnInit } from '@angular/core';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import * as L from 'leaflet';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';


@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
})
export class SobrePage implements OnInit {

  map: L.Map;
  newMarker:any;
  address:string[];

  constructor(
    private geolocation: Geolocation,
    private callNumber: CallNumber) { }

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

    this.geolocation.getCurrentPosition().then((resp) => {
      let latitud = 37.82786563736045;
      let longitud = -1.3877155585987992;
      let zoom = 17;
      this.map = L.map("mapId").setView([latitud, longitud], zoom);
      L.tileLayer('https://a.tile.openstreetmap.de/{z}/{x}/{y}.png')
        .addTo(this.map);
     }).catch((error) => {
       console.log('Error getting location', error);
    });
    
  }
}
