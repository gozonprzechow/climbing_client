import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { InputCondition } from '../models/inputLocality';
import { ValidationService } from '../models/validation';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { MathServices, ConvertedBytes } from '../services/math.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-hlavni-form',
  templateUrl: './admin-hlavni-form.component.html',
  styleUrls: ['./admin-hlavni-form.component.css']
})

export class AdminHlavniFormComponent implements OnInit {

  submitted = false;
  userForm: FormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  activePage: any = {};
  serverInfo: any = {};
  allLocality: any = [];

  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;
  convertedBytes: ConvertedBytes = {
    numberofBytes: 0,
    unit: ""
  };

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public auth: AuthenticationService,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public mathServices: MathServices,
    public http: HttpClient) {
    this.tittleMain = 'Admin page';
    this.confirmModalMessage = "Really want delete this user?";
    this.confirmModalTitle = "Delete user";
  }

  invalidEmail() {
    return (this.submitted && this.userForm.controls.email.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.userForm = this.formBuilder.group({
      email: ['', [Validators.required, ValidationService.emailValidator]],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.auth.saveActualUserId(postedBy);
    this.http.get(environment.urlAddress + '/api/v1/user_input/deleteAccountAdmin/' + postedBy).subscribe((data: any) => {
      this.serverInfo = data.serverInfo;
      this.convertedBytes = this.mathServices.setUserFriendlyByteUnit(this.serverInfo.imagesSize);
      this.activePage = data.activePage;
      this.allLocality = data.localities;
    }, error => {
      this.routerService.notLoginError();
    });
  }

  openConfirmModal() {
    const initialState = {
      list: {
        "confirmModalMessage": this.confirmModalMessage,
        "confirmModalTitle": this.confirmModalTitle,
        "modalRef": BsModalRef
      }
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState })
    );
    this.modalRef.content.event.subscribe(res => {
      this.onSubmit();
    });
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {

      this.cleanServerErrors();
      this.inputCondition.successLoad = null;
      return;

    }
    else {

      Object.keys(this.userForm.value).forEach(key => {
        formData.append(key, this.userForm.value[key]);
      });
      formData.append("deleteMessage", "Delete account by admin");
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/deleteAccountAdmin', formData).subscribe((returnData: any) => {

        this.inputCondition.errorLoad = returnData.deleteSuccess;
        this.serverInfo = returnData.serverInfo;
        this.copyServerErrors(returnData);

        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.submitted = false;
          this.userForm.reset();
        }

      }, error => {
        this.routerService.notLoginError();
        this.serverServiceErrors.uploadSuccess = null;
      });
    }
  }

}