import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { RouterServices } from '../services/router.services';
import { ImageService } from '../services/image.service';
import {
  ButtonCollection,
  PagingButtonsServices,
} from '../services/pagingButtons.service';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';
import { ShapeService } from '../services/shape.service';
import { MapService, LabelParam } from '../services/map.service';
import * as L from 'leaflet';
import { MathServices } from '../services/math.service';

@Component({
  selector: 'app-user-map-form',
  templateUrl: './user-map-form.component.html',
  styleUrls: ['./user-map-form.component.css'],
})
export class UserMapFormComponent implements OnInit, OnDestroy, AfterViewInit {
  private map;

  country: string = 'none';
  region: string = 'none';
  stateLayer: any = {};
  is_country_map: boolean = false;

  modalRef: BsModalRef;

  buttonCollections: ButtonCollection[] = [];

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public route: ActivatedRoute,
    public routerService: RouterServices,
    public pagingButtons: PagingButtonsServices,
    public auth: AuthenticationService,
    public globals: Globals,
    public router: Router,
    private location: Location,
    public languageService: LanguageService,
    public modalService: BsModalService,
    public imageService: ImageService,
    public mobileService: MobileService,
    public resizeSvc: ResizeService,
    private shapeService: ShapeService,
    private map_service: MapService,
    public mathServices: MathServices,
  ) {}

  public subscriber: any;

  public routeToUserLocality(localityName) {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocality(localityName, userId, 0);
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();
  }

  ngAfterViewInit(): void {
    this.initMap();
    let postedBy;
    this.subscriber = this.route.params.subscribe((params) => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
        this.auth.saveActualUserId(postedBy);
      } else {
        postedBy = params.idPostedBy;
        this.auth.saveActualUserId(postedBy);
      }
      this.country = this.mathServices.hexToString(params.country);
      if ('world' === this.country) {
        this.shapeService
          .getStateShapes('/assets/geojson/countries.json')
          .subscribe((geojson_area) => {
            this.httpGetCountryData();
            this.map_service.updateGeojsonArea(geojson_area);
            this.initStatesLayer();
            this.is_country_map = false;
          });
      } else {
        let region_geojson = this.map_service.getRegionGeojson(this.country);
        if (region_geojson) {
          this.map.removeLayer(this.stateLayer);
          this.modifyUrl(this.country);
          this.shapeService
            .getStateShapes('/assets/geojson/' + region_geojson)
            .subscribe((geojson_area) => {
              this.httpGetRegionData(this.country);
              this.map_service.updateGeojsonArea(geojson_area);
              this.initRegionsLayer();
              this.map_service.initRegionView(this.map);
              this.is_country_map = true;
            });
        } else {
          this.goBackToWorldMap();
        }
      }
    });
  }

  ngOnDestroy() {}

  private initMap(): void {
    this.map = L.map('map', {
      center: [50, 14.4],
      zoom: 4.4,
      doubleClickZoom: false,
    });

    const tiles = L.tileLayer('', {
      className: 'custom-class',
      opacity: 0.7,
      maxZoom: 19,
      minZoom: 2,
      noWrap: true, //this is the crucial line!
      bounds: [
        [-90, -180],
        [90, 180],
      ],
      detectRetina: true,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);
  }

  private initStatesLayer() {
    this.stateLayer = L.geoJSON(this.map_service.getGeojsonArea(), {
      style: this.map_service.getInitialGeojsonAreaStyle(),
      onEachFeature: (feature, layer) =>
        layer.on({
          dblclick: (e) => this.activateGeojsonCountry(e),
          mouseover: (e) => this.showCountryLabels(e),
          mouseout: (e) => this.hideCountryLabels(e),
        }),
    });

    this.map.addLayer(this.stateLayer);
  }

  private activateGeojsonCountry(e) {
    const layer = e.target;
    this.country = layer.feature.properties.name;
    let region_geojson = this.map_service.getRegionGeojson(this.country);
    if (region_geojson) {
      this.map.removeLayer(this.stateLayer);
      this.modifyUrl(layer.feature.properties.name);
      this.shapeService
        .getStateShapes('/assets/geojson/' + region_geojson)
        .subscribe((geojson_area) => {
          this.httpGetRegionData(layer.feature.properties.name);
          this.map_service.updateGeojsonArea(geojson_area);
          this.initRegionsLayer();
          this.map_service.initRegionView(this.map);
          this.is_country_map = true;
        });
    } else {
      if (0 < this.map_service.getLabelParam(layer).minerals) {
        let userId = this.auth.getActualUserId();
        this.region = 'none';
        this.routerService.userLocalities(
          userId,
          0,
          this.country,
          this.region,
        );
      }
    }
  }

  private httpGetCountryData() {
    this.http
      .get(
        environment.urlAddress +
          '/api/v1/user_input/userMap/' +
          this.auth.getActualUserId(),
      )
      .subscribe((data: any) => {
        this.map_service.updateGeojsonAreaData(data.countries);
        this.stateLayer.eachLayer((layer) => {
          this.map_service.setGeojsonAreaStyle(layer);
        });
      });
  }

  private httpGetRegionData(country: string) {
    this.http
      .get(
        environment.urlAddress +
          '/api/v1/user_input/userRegionMap/' +
          this.auth.getActualUserId() +
          '/' +
          country,
      )
      .subscribe((data: any) => {
        this.map_service.updateGeojsonAreaData(data.countries);
        this.stateLayer.eachLayer((layer) => {
          this.map_service.setGeojsonAreaStyle(layer);
        });
      });
  }

  private showCountryLabels(e) {
    const layer = e.target;
    this.map_service.setCountryLabel(layer);
    this.map_service.setGeojsonAreaStyle(layer, true);
  }

  private hideCountryLabels(e) {
    const layer = e.target;
    this.map_service.setGeojsonAreaStyle(layer);
    layer.unbindTooltip();
  }

  private initRegionsLayer() {
    this.stateLayer = L.geoJSON(this.map_service.getGeojsonArea(), {
      style: this.map_service.getInitialGeojsonAreaStyle(),
      onEachFeature: (feature, layer) =>
        layer.on({
          dblclick: (e) => this.activateGeojsonRegion(e),
          mouseover: (e) => this.showRegionLabels(e),
          mouseout: (e) => this.hideRegionLabels(e),
        }),
    });

    this.map.addLayer(this.stateLayer);
  }

  private activateGeojsonRegion(e) {
    const layer = e.target;
    this.region = layer.feature.properties.name;
    if (0 < this.map_service.getLabelParam(layer).minerals) {
      let userId = this.auth.getActualUserId();
      this.routerService.userLocalities(
        userId,
        0,
        this.country,
        this.region,
      );
    }
  }

  private showRegionLabels(e) {
    const layer = e.target;
    this.map_service.setCountryLabel(layer);
    this.map_service.setGeojsonAreaStyle(layer, true);
  }

  private hideRegionLabels(e) {
    const layer = e.target;
    this.map_service.setGeojsonAreaStyle(layer);
    layer.unbindTooltip();
  }

  private findById(localityCollections, id) {
    for (var localityCollection of localityCollections) {
      for (var achatDbCollection of localityCollection.achatdbCollections) {
        if (achatDbCollection._id === id) {
          return achatDbCollection;
        }
      }
    }
    return undefined;
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.resizeSvc.countImageWidth();
  }

  private modifyUrl(country: string) {
    country = this.mathServices.stringToHex(country);
    let url: string = 'userMap/' + this.auth.getActualUserId() + '/' + country;
    this.location.replaceState(url);
  }

  public goBackToWorldMap(res?: any) {
    this.modifyUrl('world');
    this.map.removeLayer(this.stateLayer);
    this.shapeService
      .getStateShapes('/assets/geojson/countries.json')
      .subscribe((geojson_area) => {
        this.httpGetCountryData();
        this.map_service.updateGeojsonArea(geojson_area);
        this.initStatesLayer();
        this.map_service.initCountryView(this.map);
      });
    this.is_country_map = false;
  }
}
