import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';

@Component({
  selector: 'app-verified-create-account-form',
  templateUrl: './verified-create-account-form.component.html',
  styleUrls: ['./verified-create-account-form.component.css', '../models/mobile.css'],
})
export class VerifiedCreateAccountFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  tittleMain: string;
  message: string;

  product: any = {};

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public route: ActivatedRoute,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
  ) {
    this.tittleMain = 'Account was verified';
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    this.subscriber = this.route.params.subscribe((params) => {
      this.http
        .get(environment.urlAddress + '/api/v1/user_input/verify/' + params.uid)
        .subscribe((data: any) => {
          this.message = data.message;
        });
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }
}
