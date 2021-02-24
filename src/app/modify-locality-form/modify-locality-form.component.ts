import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient } from "@angular/common/http";
import { InputCondition } from '../models/inputLocality';
import { AuthenticationService } from '../services/authentication.service';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modify-locality-form',
  templateUrl: './modify-locality-form.component.html',
  styleUrls: ['./modify-locality-form.component.css']
})

export class ModifyLocalityFormComponent implements OnInit {
  submitted = false;
  userForm: FormGroup;
  guid: string;
  activePage: any = {};
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  allLocality: any = [];
  tittleMain: string;
  localityUnderChange: any = {};
  previousRoute: string;

  product: any = {};

  modalRef: BsModalRef;

  constructor(
    public elementRef: ElementRef,
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public modalService: BsModalService,
    public routerService: RouterServices,
    public auth: AuthenticationService) {
  }

  public invalidName() {
    return (this.submitted && this.userForm.controls.name.errors != null);
  }

  public invalidDescription() {
    return (this.submitted && this.userForm.controls.description.errors != null);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.name = returnData.inputErrorMessage.name;
    this.serverServiceErrors.description = returnData.inputErrorMessage.description;
    this.serverServiceErrors.errorMessage = returnData.inputErrorMessage.errorMessage;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.name = null;
    this.serverServiceErrors.description = null;
    this.serverServiceErrors.uploadSuccess = null;
    this.serverServiceErrors.errorMessage = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';

    this.product = history.state;
    if (this.product.data == null) {
      this.routerService.inputLocality();
    }
    else {
      this.localityUnderChange = this.product.data.locality;
      this.previousRoute = this.product.data.previousRoute;
    }

    this.userForm = this.formBuilder.group({
      name: [this.localityUnderChange.name, [Validators.required, Validators.maxLength(50)]],
      description: [this.localityUnderChange.description],
    },
      { updateOn: "submit" }
    );

    let postedBy = this.auth.getLogUserId();
    this.http.get(environment.urlAddress + '/api/v1/user_input/locality/' + postedBy).subscribe((data: any) => {
      this.guid = data.guid;
      this.activePage = data.activePage;
      this.allLocality = data.localities;
      this.tittleMain = 'Modify locality';
    }, error => {
      this.routerService.login();
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


      let postedBy = this.auth.getLogUserId();
      formData.append("locality", JSON.stringify(this.localityUnderChange));
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/modifyLocality/' + postedBy, formData).subscribe((returnData: any) => {

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

  copyReturnData(returnData) {
    this.inputCondition.errorLoad = null;
    this.activePage = returnData.activePage;
    this.copyServerErrors(returnData);
    this.allLocality = returnData.localities;
  }

  setDataOnUploadSuccess() {
    this.submitted = false;
    this.userForm.reset();
    this.routerService.returnToPreviousPage(this.previousRoute);
  }

}