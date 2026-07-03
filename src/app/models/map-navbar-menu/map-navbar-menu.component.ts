import {
  Component,
  Input,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SCREEN_SIZE } from '../../services/resize.service';

@Component({
    selector: 'app-map-navbar-menu',
    templateUrl: './map-navbar-menu.component.html',
    styleUrls: ['./map-navbar-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MapNavbarMenuComponent implements OnInit {
  @Input() friends: any = [];
  @Input() screen_size: SCREEN_SIZE;
  @Input() is_country_map: boolean = false;
  @Input() country: string = 'none';
  @Input() region: string = 'none';
  previous_screen_size: SCREEN_SIZE;
  navbarOpen = false;
  img_go_inside: String;
  img_step_back: String;
  dropdownMenuClass: String = '';

  search_user: String;
  modalRef: BsModalRef;
  @Output() event: EventEmitter<any> = new EventEmitter();

  constructor(
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public modalService: BsModalService,
    public http: HttpClient,
    public languageService: LanguageService,
  ) {
    this.img_step_back = '../../../assets/skins/back_arrow.png';
    this.img_go_inside = '../../../assets/skins/inside_arrow.png';
  }

  ngOnInit() {
    this.previous_screen_size = this.screen_size;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (this.previous_screen_size != this.screen_size) {
      this.navbarOpen = false;
      this.previous_screen_size = this.screen_size;
    }
  }

  public getAlertDropdownMenuClass() {
    let dropdown_alert_class;
    if (this.navbarOpen) {
      dropdown_alert_class = 'dropdownStyle';
    } else {
      dropdown_alert_class = 'dropdownStyle dropdown-menu-right';
    }
    return dropdown_alert_class;
  }

  // public onResize(event) {
  //   this.navbarOpen = false;
  //   this.dropdownMenuClass = '';
  // }

  public toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  public routeStepBack() {
    if (this.is_country_map) {
      this.event.emit({});
    } else {
      let userId = this.auth.getActualUserId();
      this.routerService.userLocalities(userId, 0);
    }
  }

  public routeGoInside() {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocalities(userId, 0, this.country);
  }

  public isShowGoInside() {
    if ('none' !== this.country) {
      return true;
    }
    return false;
  }
}
