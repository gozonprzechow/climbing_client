import { Component, OnInit, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';
import * as L from 'leaflet';
import { ShapeService } from '../../services/shape.service';
import { SCREEN_SIZE } from '../../services/resize.service';

@Component({
  selector: 'app-input-map-modal',
  templateUrl: './input-map-modal.component.html',
  styleUrls: ['./input-map-modal.component.css'],
})
export class InputMapModalComponent implements OnInit, AfterViewInit {
  textValue: string;
  actualSlide: number = 0;
  list: any = {};
  public event: EventEmitter<any> = new EventEmitter();

  private map;
  private states;
  i: number = 0;

  constructor(
    public http: HttpClient,
    public bsModalRef: BsModalRef,
    public auth: AuthenticationService,
    private shapeService: ShapeService,
  ) {}

  public subscriber: any;

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.shapeService.getStateShapes(this.list.geojsonMap).subscribe((states) => {
      this.states = states;
      // console.log(this.states);
      this.initMap();
      this.initStatesLayer();
      setTimeout(() => {
        this.refreshMap();
      }, 50);
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.states.custom.center,
      zoom: this.states.custom.zoom,
    });

    // 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const tiles = L.tileLayer('', { 
      opacity: 0.7,
      maxZoom: 19,
      minZoom: 2,
      noWrap: true, //this is the crucial line!
      bounds: this.states.custom.bounds,
      // bounds: [
      //   [-90, -180],
      //   [90, 180],
      // ],
      detectRetina: true,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);
  }

  private initStatesLayer() {
    const stateLayer = L.geoJSON(this.states, {
      style: (feature) => ({
        weight: 3,
        opacity: 0.5,
        color: '#008f68',
        fillOpacity: 0.8,
        fillColor: '#6DB65B',
      }),
      onEachFeature: (feature, layer) =>
        layer.on({
          dblclick: (e) => this.highlightFeature(e),
          mouseover: (e) => this.showLabels(e),
          mouseout: (e) => this.resetFeature(e),
        }),
    });

    this.map.addLayer(stateLayer);
  }

  private highlightFeature(e) {
    const layer = e.target;
    // console.log(e.target.feature.properties.name);
    this.bsModalRef.hide();
    this.event.emit({ state: e.target.feature.properties.name });

    // layer.setStyle({
    //   weight: 5,
    //   opacity: 1.0,
    //   color: '#DFA612',
    //   fillOpacity: 1.0,
    //   fillColor: '#FAE042',
    // });
  }

  private showLabels(e) {
    const layer = e.target;
    layer.bindTooltip(
      e.target.feature.properties.name +
        '<br>' +
        'localities: ' +
        e.target.feature.properties.localities,
      {
        permanent: true,
        offset: [0, 34],
        sticky: true,
        direction: 'center',
        className: 'countryLabel',
      },
    );

    layer.setStyle({
      weight: 5,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042',
    });
  }

  private resetFeature(e) {
    const layer = e.target;
    layer.unbindTooltip();

    layer.setStyle({
      weight: 3,
      opacity: 0.5,
      color: '#008f68',
      fillOpacity: 0.8,
      fillColor: '#6DB65B',
    });
  }

  triggerConfirmEvent() {
    this.bsModalRef.hide();
    this.event.emit({ res: 200 });
  }

  getModalBodyHeight() {
    let modal_body_height;
    if (SCREEN_SIZE.XS == this.list.screenSize) {
      modal_body_height = this.list.pageSize * 1.2;
    } else if (SCREEN_SIZE.SM == this.list.screenSize) {
      modal_body_height = this.list.pageSize * 0.9;
    } else {
      modal_body_height = this.list.pageSize * 0.55;
    }
    return modal_body_height;
  }

  refreshMap() {
    if (this.map) {
      // this.streetMaps.redraw();
      this.map.invalidateSize();
    }
  }
}
