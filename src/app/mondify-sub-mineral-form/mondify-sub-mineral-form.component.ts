import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { InputCondition } from '../models/inputMineral';
import { AuthenticationService } from '../services/authentication.service';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-mondify-sub-mineral-form',
  templateUrl: './mondify-sub-mineral-form.component.html',
  styleUrls: ['./mondify-sub-mineral-form.component.css']
})

export class MondifySubMineralFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  prefix: string;
  serviceErrors: any = {};
  activePage: any = {};
  achatdbCollection: any = {};
  actualSlide: any = {};
  subMineralId: any = {};
  previousRoute: string;
  allLocality: any = [];
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  tittleMain: string;
  titleImage: string;

  imgURL: any;
  product: any = {};
  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public auth: AuthenticationService) {
    this.prefix = "http://server.sutrak.net/static/uploads/images/";
    this.confirmModalMessage = "Do you want delete this sub-image?";
    this.confirmModalTitle = "Delete sub-image";
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resetTitleImage();

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputMineral();
    }
    else {
      this.achatdbCollection = this.product.data.achatdbCollection;
      this.actualSlide = this.product.data.actualSlide;
      this.previousRoute = this.product.data.previousRoute;

      this.subMineralId = this.achatdbCollection.achatImages[this.actualSlide]._id;
    }

    this.imgURL = this.getImageLarge(this.achatdbCollection.achatImages[this.actualSlide].imgName);

    this.userForm = this.formBuilder.group({
      comment: [this.achatdbCollection.achatImages[this.actualSlide].comment, [Validators.required, Validators.maxLength(50)]],
      img: [null],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.http.get(environment.urlAddress + '/api/v1/user_input/modifySubMineral/' + postedBy).subscribe((returnData: any) => {
      this.allLocality = returnData.localities;
      this.activePage = returnData.activePage;
      this.tittleMain = 'Modify Sub-mineral';
    }, error => {
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
      this.runDeleteSubImage();
    });
  }

  isFieldValid(field: string) {
    return !this.userForm.get(field).valid && this.userForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  displayImgFieldCss(field: string) {
    return {
      'has-error': true,
      'has-feedback': true
    };
  }

  resetTitleImage() {
    this.titleImage = "Change Image";
  }

  invalidComment() {
    return (this.submitted && this.userForm.controls.comment.errors != null);
  }

  invalidImg() {
    return (this.submitted && this.userForm.controls.img.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.comment = returnData.inputErrorMessage.comment;
    this.serverServiceErrors.img = returnData.inputErrorMessage.img;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.comment = null;
    this.serverServiceErrors.img = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  public getImageLarge(imgName): string {
    return this.prefix + imgName;
  }

  onFileSelect(event) {
    if (1 == event.target.files.length) {
      const file = event.target.files[0];
      this.userForm.get('img').setValue(file);
      this.titleImage = file.name;
      event.srcElement.value = "";

      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
      }
    }
  }

  runDeleteSubImage() {
    let formData = new FormData();
    formData.append("achatdbCollection", JSON.stringify(this.achatdbCollection));
    formData.append("subMineralId", JSON.stringify(this.subMineralId));
    this.http.post<any>(environment.urlAddress + '/api/v1/user_input/deleteSubMineral', formData).subscribe((returnData: any) => {
      this.routerService.returnToPreviousPage(this.previousRoute);
    }, error => {
      this.inputCondition.errorLoad = "You are not log in, please log in first";
      this.serverServiceErrors.uploadSuccess = null;
    });
  }

  onSubmit() {
    let formData = new FormData();
    this.submitted = true;

    if (this.userForm.invalid == true) {
      this.invalidFormAction();
      return;

    }
    else {
      formData = this.appendFormData(formData);
      let postedBy = this.auth.getLogUserId();
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/modifySubMineral/' + postedBy, formData).subscribe((returnData: any) => {

        this.copyReturnData(returnData);
        if (null == returnData.inputErrorMessage.uploadSuccess) {
        }
        else {
          this.setDataOnUploadSuccess();
        }
      }, error => {
        this.routerService.notLoginError();
        this.serverServiceErrors.uploadSuccess = null;
      });

    }
  }

  invalidFormAction() {
    this.cleanServerErrors();
    this.inputCondition.successLoad = null;
  }

  appendFormData(formData) {
    Object.keys(this.userForm.value).forEach(key => {
      formData.append(key, this.userForm.value[key]);
    });
    formData.append("achatdbCollection", JSON.stringify(this.achatdbCollection));
    formData.append("subMineralId", JSON.stringify(this.subMineralId));
    return formData;
  }

  copyReturnData(returnData) {
    this.inputCondition.errorLoad = null;
    this.activePage = returnData.activePage;
    this.copyServerErrors(returnData);
    this.allLocality = returnData.localities;
  }

  setDataOnUploadSuccess() {
    this.submitted = false;
    this.userForm.get('img').setValue('', { emitEvent: true });
    this.userForm.reset();
    this.resetTitleImage();
    this.imgURL = null;
    this.routerService.returnToPreviousPage(this.previousRoute);
  }

}

