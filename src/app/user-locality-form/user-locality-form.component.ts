import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { RouterServices } from '../services/router.services';
import { ButtonCollection, PagingButtonsServices } from '../services/pagingButtons.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-locality-form',
  templateUrl: './user-locality-form.component.html',
  styleUrls: [
    './user-locality-form.component.css'
  ]
})

export class UserLocalityFormComponent implements OnInit {
  selectLocality: string;
  allLocality: any = [];
  actualLocality: any = {};
  activePage: any = {};
  tittleMain: string;
  achatdbCollections: any = [];
  prefix: string;
  suffix: string;
  deleteCollection: any = {};
  confirmModalMessage: string;
  confirmModalTitle: string;

  modalRef: BsModalRef;

  buttonCollections: ButtonCollection[] = [];

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public route: ActivatedRoute,
    public modalService: BsModalService,
    public auth: AuthenticationService,
    public routerService: RouterServices,
    public pagingButtons: PagingButtonsServices,
    public router: Router,
    public globals: Globals) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.confirmModalMessage = "Do you want delete whole collection?";
    this.confirmModalTitle = "Delete image";
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';

    let postedBy;
    this.subscriber = this.route.params.subscribe(params => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      }
      else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPage(params.page);

      this.http.get(environment.urlAddress + '/api/v1/locality/one/' + params.uid + '/' + this.pagingButtons.getActualPage() + '/' + postedBy)
        .subscribe((data: any) => {

          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.selectLocality = data.title;
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.actualLocality = data.locality;
          this.tittleMain = this.selectLocality;
          this.achatdbCollections = data.achatdbCollections;
          this.prefix = this.globals.serverUrl + "/static/uploads/images/";
          this.suffix = "_small";

          if (params.image && params.slide) {
            let previousUrl = "locality/" + params.uid + "/" + params.page + "/" + params.idPostedBy;
            const achatdbCollection = this.achatdbCollections.find(({ _id }) => _id === params.image);
            this.openModalOnImage(achatdbCollection, params.slide, previousUrl);
          }
        });
    });
  }


  clickPageButton(page: number): void {
    let postedBy = this.auth.getActualUserId();
    if (!postedBy) {
      postedBy = this.auth.getLogUserId();
    }
    this.routerService.userLocality(this.selectLocality, postedBy, page);
  }

  getImage(imgName): string {
    return this.prefix + imgName + this.suffix;
  }

  openModal(achatdbCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe(params => {
      previousUrl = "locality/" + params.uid + "/" + params.page + "/" + params.idPostedBy;
      const initialState = {
        list: {
          "achatdbCollection": achatdbCollection,
          "previousUrl": previousUrl
        }
      };

      this.modalRef = this.modalService.show(
        ImageModalComponent,
        Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
      );
    });
  }

  openModalOnImage(achatdbCollection, actualSlide, previousUrl) {
    const initialState = {
      list: {
        "achatdbCollection": achatdbCollection,
        "actualSlide": actualSlide,
        "previousUrl": previousUrl
      }
    };

    this.modalRef = this.modalService.show(
      ImageModalComponent,
      Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
    );
  }

  openConfirmModal(achatdbCollection) {
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
    this.deleteCollection = achatdbCollection;
    this.modalRef.content.event.subscribe(res => {
      this.confirmDeleteImage();
    });
  }

  confirmDeleteImage() {
    let formData = new FormData();

    formData.append("achatdbCollection", JSON.stringify(this.deleteCollection));

    let postedBy;
    this.subscriber = this.route.params.subscribe(params => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      }
      else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPageOnDeleteItem(params.page, this.achatdbCollections.length);

      this.http.post<any>(
        environment.urlAddress + '/api/v1/locality/one/' + params.uid + '/' + this.pagingButtons.getActualPage() + '/' + postedBy, formData
      ).subscribe((data: any) => {

        this.pagingButtons.setNumOfPage(data.numberOfPages);
        this.buttonCollections = this.pagingButtons.createButtonsField();
        this.activePage = data.activePage;
        this.actualLocality = data.locality;
        this.allLocality = data.localities;
        this.achatdbCollections = data.achatdbCollections;
        this.routerService.userLocality(params.uid, postedBy, this.pagingButtons.getActualPage());
      });
    });
  }

  public isItemYours(userId) {
    if (userId == this.auth.getLogUserId()) {
      return true;
    }
    else {
      return false;
    }
  }

}
