import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

type Point = {
  name: string;
  coords: [number, number];
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage implements AfterViewInit, OnInit {
  private map!: L.Map;
  private points!: Point[];
  private routeLayer?: L.Polyline;
  private markers: L.Marker[] = [];

  private customIcon = L.icon({
    iconUrl: 'assets/marker.svg',
    iconSize: L.point(40, 40),
  });

  constructor(
    private toastController: ToastController,
    private storage: Storage
  ) {}

  async ngAfterViewInit() {
    await this.initializeMap();

    if (this.points.length > 0) {
      this.renderRoute();
    }
  }

  async ngOnInit() {
    await this.storage.create();

    this.points = await this.storage.get('points') || [];
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
    });

    await toast.present();
  }

  async addCurrentLocation() {
    let position;

    try {
      position = await Geolocation.getCurrentPosition();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.presentToast('Error al obtener la ubicación. Asegúrate de haber otorgado permisos.');
      return;
    }

    const name: string = `Punto ${this.points.length + 1} (${new Date().toLocaleTimeString()})`;

    this.points.push({
      name: name,
      coords: [position.coords.latitude, position.coords.longitude],
    });

    await this.storage.set('points', this.points);
    this.presentToast('Ubicación agregada con el siguiente nombre: ' + name);
  }

  async renderRoute() {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    
    this.markers.forEach((marker) => this.map.removeLayer(marker));
    this.markers = [];
    
    const coords = this.points.map((point) => point.coords);

    if (coords.length < 2) {
      return;
    }
    
    const route = L.polyline(coords, {
      color: 'blue',
    }).addTo(this.map);

    this.map.fitBounds(route.getBounds());

    this.points.forEach((point) => {
      const marker = L.marker(point.coords, { icon: this.customIcon }).addTo(this.map).bindPopup(point.name);
      this.markers.push(marker);
    });
  }

  async reset() {
    this.points = [];
    await this.storage.set('points', this.points);
    this.presentToast('Puntos reiniciados.');
  }

  async initializeMap() {
    this.map = L.map('map').setView([4.6059343082114195, -74.08190726124546], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Super Mapa!',
    }).addTo(this.map);
  }

  getCount() {
    return this.points.length;
  }
}
