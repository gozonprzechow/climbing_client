import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AuthenticationService } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-first-page-form',
  templateUrl: './first-page-form.component.html',
  styleUrls: ['./first-page-form.component.css']
})
export class FirstPageFormComponent implements OnInit {
  allLocality: any = [];
  activePage: any = {};
  tittleMain: string;
  otherUsersCollections: any = [];
  prefix: string;
  suffix: string;

  modalRef: BsModalRef;

  constructor(
    public elementRef: ElementRef,
    public http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    public modalService: BsModalService,
    public auth: AuthenticationService,
    public routerService: RouterServices) {
  }

  public subscriber: any;

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';

    let postedBy;
    this.subscriber = this.route.params.subscribe(params => {
      if (!this.auth.getActualUserId()) {
        postedBy = this.auth.getLogUserId();
      }
      else {
        postedBy = this.auth.getActualUserId();
      }

      this.http.get(environment.urlAddress + '/api/v1/locality/firstPage/' + '/' + postedBy)
        .subscribe((data: any) => {
          this.activePage = data.activePage;
          this.allLocality = data.localities;
          this.tittleMain = 'Mineral collections';
          this.otherUsersCollections = data.otherUsersCollections;
          this.prefix = environment.serverUrl + "/static/uploads/images/";
          this.suffix = "_small";

          if (params.image && params.slide) {
            let previousUrl = "firstPage/";
            const achatdbCollection = this.otherUsersCollections[params.userNum]
              .achatdbCollections.find(({ _id }) => _id === params.image);
            this.openModalOnImage(achatdbCollection, params.slide, previousUrl, params.userNum);
          }
        });
    });
    this.router.navigate([], {
      queryParams: {
        'userNum': null,
        'image': null,
        'slide': null,
      },
      queryParamsHandling: 'merge'
    })
  }

  routeToAnotherUsersLocalities(anotherUserId) {
    this.auth.saveActualUserId(anotherUserId);
    this.routerService.userLocalities(anotherUserId, 0);
  }

  clickPageButton(page: number): void {
    this.routerService.otherUsers(page);
  }

  isItemExist(collection) {
    if ((collection == "") || (collection == null)) {
      return false;
    } else {
      return true;
    }
  }

  getImage(imgName): string {
    return this.prefix + imgName + this.suffix;
  }

  openModal(achatdbCollection, numOfUserCollection) {
    let previousUrl;
    this.subscriber = this.route.params.subscribe(params => {
      previousUrl = "firstPage/";
      const initialState = {
        list: {
          "achatdbCollection": achatdbCollection,
          "previousUrl": previousUrl,
          "numOfItemCollection": numOfUserCollection
        }
      };

      this.modalRef = this.modalService.show(
        ImageModalComponent,
        Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
      );
    });
    this.subscriber.unsubscribe();
  }

  openModalOnImage(achatdbCollection, actualSlide, previousUrl, numOfUserCollection) {
    const initialState = {
      list: {
        "achatdbCollection": achatdbCollection,
        "actualSlide": actualSlide,
        "previousUrl": previousUrl,
        "numOfItemCollection": numOfUserCollection
      }
    };

    this.modalRef = this.modalService.show(
      ImageModalComponent,
      Object.assign({ animated: false }, { class: 'mineralImageModal' }, { initialState })
    );
  }
}
