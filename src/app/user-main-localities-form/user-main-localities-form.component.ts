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
  selector: 'app-user-main-localities-form',
  templateUrl: './user-main-localities-form.component.html',
  styleUrls: [
    './user-main-localities-form.component.css'
  ]
})

export class UserMainLocalitiesFormComponent implements OnInit {
  allLocality: any = [];
  activePage: any = {};
  tittleMain: string;
  localityCollections: any = [];
  prefix: string;
  suffix: string;
  confirmModalMessage: string;
  confirmModalTitle: string;

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
    public modalService: BsModalService) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.confirmModalMessage = "Do you want delete this locality and all their collections?";
    this.confirmModalTitle = "Delete locality";
  }

  public subscriber: any;

  public routeToUserLocality(localityName) {
    let userId = this.auth.getActualUserId();
    this.routerService.userLocality(localityName, userId, 0);
  }

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

      this.http.get(environment.urlAddress + '/api/v1/locality/all/' + this.pagingButtons.getActualPage() + '/' + postedBy)
        .subscribe((data: any) => {

          this.pagingButtons.setNumOfPage(data.numberOfPages);
          this.buttonCollections = this.pagingButtons.createButtonsField();
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.tittleMain = 'User localities';
          this.localityCollections = data.localityCollections;
          this.prefix = environment.serverUrl + "/static/uploads/images/";
          this.suffix = "_small";

          if (params.image && params.slide) {
            let previousUrl = "localities/" + params.page + "/" + params.idPostedBy;
            const achatdbCollection = this.localityCollections[params.localityNum]
              .achatdbCollections.find(({ _id }) => _id === params.image);
            this.openModalOnImage(achatdbCollection, params.slide, previousUrl, params.localityNum);
          }
        });
    });

  }
  clickPageButton(page: number): void {
    let postedBy = this.auth.getActualUserId();
    if (!postedBy) {
      postedBy = this.auth.getLogUserId();
    }
    this.routerService.userLocalities(postedBy, page);
  }

  getImage(imgName): string {
    return this.prefix + imgName + this.suffix;
  }

  isItemExist(collection) {
    if ((collection == "") || (collection == null)) {
      return false;
    }
    return true;
  }

  openModal(achatdbCollection, numOflocalityCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe(params => {
      previousUrl = "localities/" + params.page + "/" + params.idPostedBy;
      const initialState = {
        list: {
          "achatdbCollection": achatdbCollection,
          "previousUrl": previousUrl,
          "numOfItemCollection": numOflocalityCollection
        }
      };

      this.modalRef = this.modalService.show(
        ImageModalComponent,
        Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
      );
    });
  }

  openModalOnImage(achatdbCollection, actualSlide, previousUrl, numOflocalityCollection) {
    const initialState = {
      list: {
        "achatdbCollection": achatdbCollection,
        "actualSlide": actualSlide,
        "previousUrl": previousUrl,
        "numOfItemCollection": numOflocalityCollection
      }
    };

    this.modalRef = this.modalService.show(
      ImageModalComponent,
      Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
    );
  }

  openConfirmModal(locality) {
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
      this.runDeleteLocality(locality);
    });
  }

  runDeleteLocality(locality) {
    let formData = new FormData();

    formData.append("locality", JSON.stringify(locality));

    let postedBy;
    this.subscriber = this.route.params.subscribe(params => {
      if (!params.idPostedBy) {
        postedBy = this.auth.getLogUserId();
      }
      else {
        postedBy = params.idPostedBy;
      }

      this.pagingButtons.setActualPageOnDeleteItem(params.page, this.localityCollections.length);

      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/deleteLocality/' + this.pagingButtons.getActualPage() + '/' + postedBy, formData).subscribe((data: any) => {
        this.pagingButtons.setNumOfPage(data.numberOfPages);
        this.buttonCollections = this.pagingButtons.createButtonsField();
        this.activePage = data.activePage;
        this.allLocality = data.localities;
        this.localityCollections = data.localityCollections;
        this.routerService.userLocalities(postedBy, this.pagingButtons.getActualPage());
      });
    });
  }

  public isItemYours(userId) {
    if (userId != this.auth.getLogUserId()) {
      return false;
    }
    return true;
  }
}
