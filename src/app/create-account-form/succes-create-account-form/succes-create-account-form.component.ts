import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterServices } from '../../services/router.services';
import { ResizeService, SCREEN_SIZE } from '../../services/resize.service';
import { MobileService } from '../../services/mobile.service';

@Component({
  selector: 'app-succes-create-account-form',
  templateUrl: './succes-create-account-form.component.html',
  styleUrls: ['./succes-create-account-form.component.css', '../../models/mobile.css'],
})
export class SuccesCreateAccountFormComponent implements OnInit {
  tittleMain: string;
  message: string;

  product: any = {};
  screen_size: SCREEN_SIZE;

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public routerService: RouterServices,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.tittleMain = 'Account was created.';
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.login(this.screen_size);
    } else {
      this.message = this.product.data.message;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }
}
