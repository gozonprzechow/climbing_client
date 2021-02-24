import { Component, OnInit, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})

export class ConfirmModalComponent implements OnInit {
  textValue: string;
  actualSlide: number = 0;
  list: any = {};
  public event: EventEmitter<any> = new EventEmitter();

  constructor(
    public http: HttpClient,
    public bsModalRef: BsModalRef,
    public auth: AuthenticationService) {
  }

  public subscriber: any;

  ngOnInit() {
  }

  triggerConfirmEvent() {
    this.bsModalRef.hide();
    this.event.emit({ res:200  });
  }

}
