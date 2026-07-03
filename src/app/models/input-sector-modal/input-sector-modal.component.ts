import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';
import * as L from 'leaflet';
import { ShapeService } from '../../services/shape.service';
import { ResizeService, SCREEN_SIZE } from '../../services/resize.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { InputCondition } from '../../models/inputLocality';
import { MobileService } from '../../services/mobile.service';
import { environment } from 'src/environments/environment';
import { RouterServices } from '../../services/router.services';

@Component({
    selector: 'app-input-sector-modal',
    templateUrl: './input-sector-modal.component.html',
    styleUrls: ['./input-sector-modal.component.css', '../../models/mobile.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InputSectorModalComponent implements OnInit, AfterViewInit {
  textValue: string;
  submitted = false;
  is_submit_in_progress: Boolean = false;
  userForm: UntypedFormGroup;
  actualSlide: number = 0;
  list: any = {};
  markers: any;
  imgSetLocation: string;
  allAreas: any = [];
  public event: EventEmitter<any> = new EventEmitter();

  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();

  private map;
  is_map_active: boolean = false;
  is_confirm_active: boolean = false;
  i: number = 0;

  name: string;
  area: string = "";
  description: string;
  priority: number = 1;
  lat: number;
  lng: number;

  name_txt: string;
  nameTranslation: TextTranslator = {
    cz: 'Jméno',
    en: 'Name',
  };
  area_txt: string;
  areaTranslation: TextTranslator = {
    cz: 'Oblast',
    en: 'Area',
  };
  description_txt: string;
  descriptionTranslation: TextTranslator = {
    cz: 'Popis',
    en: 'Description',
  };
  priority_txt: string;
  priorityTranslation: TextTranslator = {
    cz: 'Priorita <0, 1000>',
    en: 'Priority <0, 1000>',
  };

  store_txt: string;
  storeTranslation: TextTranslator = {
    cz: 'Uložit',
    en: 'Store',
  };
  submitInProgress_txt: string;
  submitInProgressTranslation: TextTranslator = {
    cz: 'Čekej. . .',
    en: 'Wait. . .',
  };

  constructor(
    public http: HttpClient,
    public bsModalRef: BsModalRef,
    public formBuilder: UntypedFormBuilder,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public resizeSvc: ResizeService,
    private shapeService: ShapeService,
    public routerService: RouterServices,
    public mobileService: MobileService,
  ) {
    this.imgSetLocation = '../../../assets/skins/globus_button.png';

    this.name_txt = this.languageService.getNativeLanguageText(this.nameTranslation);
    this.area_txt = this.languageService.getNativeLanguageText(
      this.areaTranslation,
    );
    this.description_txt = this.languageService.getNativeLanguageText(
      this.descriptionTranslation,
    );
    this.priority_txt = this.languageService.getNativeLanguageText(
      this.priorityTranslation,
    );
    this.store_txt = this.languageService.getNativeLanguageText(this.storeTranslation);
    this.submitInProgress_txt = this.languageService.getNativeLanguageText(this.submitInProgressTranslation);
  }

  public subscriber: any;

  public invalidName() {
    return this.submitted && this.userForm.controls.name.errors != null;
  }

  public invalidArea() {
    return this.submitted && this.userForm.controls.area.errors != null;
  }

  public invalidDescription() {
    return this.submitted && this.userForm.controls.description.errors != null;
  }

  public invalidPriority() {
    return this.submitted && this.userForm.controls.priority.errors != null;
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.name = returnData.inputErrorMessage.name;
    this.serverServiceErrors.area = returnData.inputErrorMessage.area;
    this.serverServiceErrors.description = returnData.inputErrorMessage.description;
    this.serverServiceErrors.errorMessage = returnData.inputErrorMessage.errorMessage;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.name = null;
    this.serverServiceErrors.area = null;
    this.serverServiceErrors.description = null;
    this.serverServiceErrors.uploadSuccess = null;
    this.serverServiceErrors.errorMessage = null;
  }

  ngOnInit() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.userForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.maxLength(50)]],
        area: ['', [Validators.required, Validators.maxLength(100)]],
        description: [''],
        priority: [1, [Validators.maxLength(100), Validators.pattern('^[0-9]+$')]],
      },
      { updateOn: 'submit' },
    );
    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http
      .get(environment.urlAddress + '/api/v1/user_input/sector/' + postedBy)
      .subscribe(
        (data: any) => {
          this.allAreas = data.areas;
        },
        (error) => {
          this.routerService.notLoginError();
        },
      );
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  ngAfterViewInit(): void {
    this.initMap();
    setTimeout(() => {
      this.refreshMap();
    }, 200);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [50, 15.4],
      zoom: 3,
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
    let propagate_this = this;
    this.map.on('click', function (e) {
      if (propagate_this.markers) {
        propagate_this.map.removeLayer(propagate_this.markers);
      }
      propagate_this.lat = e.latlng.lat;
      propagate_this.lng = e.latlng.lng;
      propagate_this.markers = L.marker(e.latlng).addTo(propagate_this.map);
      propagate_this.is_confirm_active = true;
    });
  }

  triggerInputLocation() {
    this.is_map_active = !this.is_map_active;
    if (this.is_map_active) {
      this.imgSetLocation = '../../../assets/skins/globus_button.png';
      setTimeout(() => {
        this.refreshMap();
      }, 200);
    }
  }

  confirmLocation() {
    this.is_confirm_active = false;
    this.is_map_active = false;
    setTimeout(() => {
      if (this.name) {
        this.userForm.controls['name'].setValue(this.name);
      }
      this.userForm.controls['area'].setValue(this.area);
      if (this.description) {
        this.userForm.controls['description'].setValue(this.description);
      }
      this.userForm.controls['priority'].setValue(this.priority.toString());
    }, 100);
  }

  closeModal() {
    this.is_confirm_active = false;
    if (this.is_map_active) {
      this.is_map_active = !this.is_map_active;
      setTimeout(() => {
        if (this.name) {
          this.userForm.controls['name'].setValue(this.name);
        }
        this.userForm.controls['area'].setValue(this.area);
        if (this.description) {
          this.userForm.controls['description'].setValue(this.description);
        }
        this.userForm.controls['priority'].setValue(this.priority.toString());
      }, 100);
    }
    else {
      this.bsModalRef.hide();
    }
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

  changeName(event) {
    this.name = event.target.value;
  }

  changeArea(event) {
    this.area = event.target.value;
  }

  changeDescription(event) {
    this.description = event.target.value;
  }

  changePriority(event) {
    this.priority = event.target.value;
  }

  onSubmit() {
    if (this.is_submit_in_progress) {
      return;
    }
    this.is_submit_in_progress = true;
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.cleanServerErrors();
      this.is_submit_in_progress = false;
      this.inputCondition.successLoad = null;
      return;
    } else {
      Object.keys(this.userForm.value).forEach((key) => {
        formData.append(key, this.userForm.value[key]);
      });
      formData.append('lat', this.lat.toString());
      formData.append('lng', this.lng.toString());

      let postedBy = this.auth.getLogUserId();
      this.http
        .post<any>(
          environment.urlAddress + '/api/v1/user_input/sector/' + postedBy,
          formData,
        )
        .subscribe(
          (returnData: any) => {
            this.is_submit_in_progress = false;
            this.inputCondition.errorLoad = null;
            this.copyServerErrors(returnData);

            if (null == returnData.inputErrorMessage.uploadSuccess) {
            } else {
              // this.country = '';
              // this.region = '';
              this.submitted = false;
              // this.userForm.setValue({ name: '', description: '', priority: 1 });
              setTimeout(() => {
                this.bsModalRef.hide();
                this.event.emit({ res: 200 });
              }, 1100);
            }
          },
          (error) => {
            this.routerService.notLoginError();
            this.serverServiceErrors.uploadSuccess = null;
          },
        );
    }
  }
}
