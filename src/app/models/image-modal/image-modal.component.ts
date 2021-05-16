import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';

import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { ConfirmModalComponent } from '../../models/confirm-modal/confirm-modal.component';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../../services/language.service';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.css']
})

export class ImageModalComponent implements OnInit, OnDestroy, AfterViewChecked {
  submitted = false;
  userForm: FormGroup;
  prefix: string;
  carrouselCollection: any = {};
  showComments: boolean = false;
  showAddComment: boolean = false;
  imageInformation: boolean = false;
  newCommentText: string;
  textValue: string;

  numOfItemCollection: string = "";
  actualSlide: number = 0;
  defaultSlide: number = 0;
  list: any = {};

  singleSlideOffset = true;

  confirmModalMessage: string;
  previousUrl: string;
  confirmModalTitle: string;
  modalRef: BsModalRef;
  imgSrc: String;

  comments_txt: string;
  commentsTranslation: TextTranslator = {
    cz: "Komentáře",
    en: "Comments"
  };
  edit_txt: string;
  editTranslation: TextTranslator = {
    cz: "Upravit",
    en: "Edit"
  };
  addNew_txt: string;
  addNewTranslation: TextTranslator = {
    cz: "Přidat nový",
    en: "Add new"
  };
  submit_txt: string;
  submitTranslation: TextTranslator = {
    cz: "Potvrdit",
    en: "Submit"
  };
  cancle_txt: string;
  cancleTranslation: TextTranslator = {
    cz: "Zrušit",
    en: "Cancle"
  };
  delete_txt: string;
  deleteTranslation: TextTranslator = {
    cz: "Smazat",
    en: "Delete"
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: "Chcete smazat tento komentář?",
    en: "Do you want delete this comment?"
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: "Smazat komentář",
    en: "Delete comment"
  };

  constructor(
    public formBuilder: FormBuilder,
    public http: HttpClient,
    public routerService: RouterServices,
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    public router: Router,
    public route: ActivatedRoute,
    public languageService: LanguageService,
    private location: Location,
    public auth: AuthenticationService) {
    this.comments_txt = this.languageService.getNativeLanguageText(this.commentsTranslation);
    this.edit_txt = this.languageService.getNativeLanguageText(this.editTranslation);
    this.addNew_txt = this.languageService.getNativeLanguageText(this.addNewTranslation);
    this.submit_txt = this.languageService.getNativeLanguageText(this.submitTranslation);
    this.cancle_txt = this.languageService.getNativeLanguageText(this.cancleTranslation);
    this.delete_txt = this.languageService.getNativeLanguageText(this.deleteTranslation);
    this.modalMessage_txt = this.languageService.getNativeLanguageText(this.modalMessageTranslation);
    this.modalTitle_txt = this.languageService.getNativeLanguageText(this.modalTitleTranslation);

    this.prefix = environment.serverUrl + "/static/uploads/images/";
    this.confirmModalMessage = this.modalMessage_txt;
    this.confirmModalTitle = this.modalTitle_txt;
    this.imgSrc = '../../../assets/skins/like_button.png';
  }

  public subscriber: any;

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.previousUrl) {
      this.location.go(this.previousUrl);
    }
  }

  ngAfterViewChecked() {
    if (this.list.actualSlide) {
      this.actualSlide = this.list.actualSlide;
      this.list.actualSlide = null;
    }

    if (this.list.numOfItemCollection) {
      this.numOfItemCollection = this.list.numOfItemCollection;
      this.list.numOfItemCollection = null;
    } else if (0 === this.list.numOfItemCollection) {
      this.numOfItemCollection = "0";
      this.list.numOfItemCollection = null;
    }

    if (this.list.previousUrl) {
      this.previousUrl = this.list.previousUrl;
      this.list.previousUrl = null;
    }

    if ("./" == this.previousUrl) {
      this.location.go(this.previousUrl + "0" + "/" +
        this.list.achatdbCollection._id + "/" + this.actualSlide);
    } else {
      if (this.numOfItemCollection && ("./" != this.previousUrl)) {
        this.location.go(this.previousUrl + "/" + this.numOfItemCollection + "/" +
          this.list.achatdbCollection._id + "/" + this.actualSlide);
      } else {
        this.location.go(this.previousUrl + "/" + this.list.achatdbCollection._id + "/" + this.actualSlide);
      }
    }
    this.setSlide(this.actualSlide);
  }

  setSlide(slide: number) {
    this.defaultSlide = slide;
  }

  openConfirmModal(achatdbCollection, communityComment) {
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
      this.deleteComment(achatdbCollection, communityComment);
    });
  }

  public showImageInformation() {
    this.imageInformation = true;
  }

  public hideImageInformation() {
    this.imageInformation = false;
    this.showComments = false;
    this.showAddComment = false;
  }

  public getImageLarge(imgName): string {
    return this.prefix + imgName;
  }

  public editImage(achatdbCollection) {
    this.bsModalRef.hide();

    if (0 < this.actualSlide) {
      this.routerService.modifySubMineral(achatdbCollection, this.actualSlide - 1);
    } else {
      this.routerService.modifyMineral(achatdbCollection);
    }
  }

  public logChangeSlide(event: number) {
    this.actualSlide = Number(event);

    if (this.numOfItemCollection) {
      this.location.go(this.previousUrl + "/" + this.numOfItemCollection + "/" +
        this.list.achatdbCollection._id + "/" + this.actualSlide);
    } else {
      this.location.go(this.previousUrl + "/" + this.list.achatdbCollection._id + "/" + this.actualSlide);
    }
  }

  public runLikeImage(achatdbCollection) {
    if (this.auth.isLoggedIn()) {
      let formData = new FormData();
      formData.append("achatdbCollection", JSON.stringify(achatdbCollection));

      let postedBy = this.auth.getLogUserId();
      this.subscriber = this.route.params.subscribe(params => {
        this.http.post<any>(environment.urlAddress + '/api/v1/user_input/like/' + params.uid + '/' + postedBy, formData).subscribe((data: any) => {
          this.list.achatdbCollection.likes.quantity = data.likes.quantity;
        });
      });
    }
  }

  public seeComments(achatdbCollection) {
    this.showComments = !this.showComments;
  }

  public seeAddComment() {
    this.showAddComment = true;
  }

  public submitComment(achatdbCollection) {
    this.newCommentText = this.textValue;
    let formData = new FormData();
    formData.append("mainImage", achatdbCollection._id);
    formData.append("newCommentText", this.newCommentText);

    let postedBy = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe(params => {
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/comment/' + params.uid + '/' + postedBy, formData)
        .subscribe((data: any) => {
          this.list.achatdbCollection.communityComments.push(data.communityComment);
          this.textValue = "";
        });
    });
  }

  public deleteComment(achatdbCollection, communityComment) {
    let formData = new FormData();
    formData.append("mainImageId", achatdbCollection._id);
    formData.append("communityCommentId", communityComment._id);
    formData.append("communityCommentCommentBy", communityComment.commentBy);

    let postedBy = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe(params => {
      this.http.post<any>(environment.urlAddress + '/api/v1/user_input/deleteComment/' + params.uid + '/' + postedBy, formData)
        .subscribe((data: any) => {
          this.list.achatdbCollection.communityComments = data.achatdbCollection.communityComments;
        });
    });
  }

  public canceAddComment() {
    this.showAddComment = false;
  }

  public showEditItem(userId) {
    if (this.isItemYours(userId) && this.imageInformation) {
      return true;
    }
    return false;
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

