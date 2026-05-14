import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation'
import * as L from "leaflet";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  private map!: L.Map;

  constructor() {}

  async getPoint() {
    const position = await Geolocation.getCurrentPosition()

    console.log(position)

    this.map = L.map("map").setView(
      [
        position.coords.latitude,
        position.coords.longitude
      ],
      18
    )

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: "Super Mapa!"
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'assets/marker.svg',
      iconSize: L.point(40, 40),
      iconAnchor: L.point(20, 20)
    })

    L.marker([position.coords.latitude, position.coords.longitude], {
      icon: customIcon
    }).addTo(this.map);


  }
}
