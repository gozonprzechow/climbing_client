import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  AfterViewChecked,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Location } from '@angular/common';
import { DatePipe } from '@angular/common';

import { AuthenticationService } from '../../services/authentication.service';
import { RouterServices } from '../../services/router.services';
import { ConfirmModalComponent } from '../../models/confirm-modal/confirm-modal.component';
import { AddOfferModalComponent } from '../../models/add-offer-modal/add-offer-modal.component';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../../services/language.service';
import { ResizeService, SCREEN_SIZE } from '../../services/resize.service';
import { MobileService } from '../../services/mobile.service';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.css', './image-modal-mobile.component.css'],
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

  numOfItemCollection: string = '';
  actualSlide: number = 0;
  defaultSlide: number = 0;
  list: any = {};

  singleSlideOffset = true;

  confirmModalMessage: string;
  previousUrl: string;
  confirmModalTitle: string;
  modalRef: BsModalRef;
  imgSrc: String;
  imgPriceSrc: String;
  imgAuctionSrc: String;

  comments_txt: string;
  commentsTranslation: TextTranslator = {
    cz: 'Komentáře',
    en: 'Comments',
  };
  edit_txt: string;
  editTranslation: TextTranslator = {
    cz: 'Upravit',
    en: 'Edit',
  };
  addNew_txt: string;
  addNewTranslation: TextTranslator = {
    cz: 'Přidat nový',
    en: 'Add new',
  };
  submit_txt: string;
  submitTranslation: TextTranslator = {
    cz: 'Potvrdit',
    en: 'Submit',
  };
  cancle_txt: string;
  cancleTranslation: TextTranslator = {
    cz: 'Zrušit',
    en: 'Cancle',
  };
  delete_txt: string;
  deleteTranslation: TextTranslator = {
    cz: 'Smazat',
    en: 'Delete',
  };
  modalMessage_txt: string;
  modalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat tento komentář?',
    en: 'Do you want delete this comment?',
  };
  modalTitle_txt: string;
  modalTitleTranslation: TextTranslator = {
    cz: 'Smazat komentář',
    en: 'Delete comment',
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
    public auth: AuthenticationService,
    private resizeSvc: ResizeService,
    public mobileService: MobileService,
    public datePipe: DatePipe,
  ) {
    this.comments_txt = this.languageService.getNativeLanguageText(
      this.commentsTranslation,
    );
    this.edit_txt = this.languageService.getNativeLanguageText(this.editTranslation);
    this.addNew_txt = this.languageService.getNativeLanguageText(this.addNewTranslation);
    this.submit_txt = this.languageService.getNativeLanguageText(this.submitTranslation);
    this.cancle_txt = this.languageService.getNativeLanguageText(this.cancleTranslation);
    this.delete_txt = this.languageService.getNativeLanguageText(this.deleteTranslation);
    this.modalMessage_txt = this.languageService.getNativeLanguageText(
      this.modalMessageTranslation,
    );
    this.modalTitle_txt = this.languageService.getNativeLanguageText(
      this.modalTitleTranslation,
    );

    // this.prefix = environment.serverUrl + '/static/uploads/images/';
    this.confirmModalMessage = this.modalMessage_txt;
    this.confirmModalTitle = this.modalTitle_txt;
    this.imgSrc = '../../../assets/skins/like_button.png';
    this.imgPriceSrc = '../../../assets/skins/insert_prize_collection.png';
    this.imgAuctionSrc = '../../../assets/skins/insert_auction_collection.png';
  }

  public subscriber: any;

  ngOnInit() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  ngOnDestroy() {
    if (this.previousUrl) {
      this.changeUrl(this.previousUrl);
    }
  }

  ngAfterViewChecked() {
    this.prefix = environment.serverUrl + '/' + this.list.achatdbCollection.imgPath;
    if (this.list.actualSlide) {
      this.actualSlide = this.list.actualSlide;
      this.list.actualSlide = null;
    }

    if (this.list.numOfItemCollection) {
      this.numOfItemCollection = this.list.numOfItemCollection;
      this.list.numOfItemCollection = null;
    } else if (0 === this.list.numOfItemCollection) {
      this.numOfItemCollection = '0';
      this.list.numOfItemCollection = null;
    }

    if (this.list.previousUrl) {
      this.previousUrl = this.list.previousUrl;
      this.list.previousUrl = null;
    }

    if ('./' == this.previousUrl) {
      this.changeUrl(
        this.previousUrl +
          '0' +
          '/' +
          this.list.achatdbCollection._id +
          '/' +
          this.actualSlide,
      );
    } else {
      if (this.numOfItemCollection && './' != this.previousUrl) {
        this.changeUrl(
          this.previousUrl +
            '/' +
            this.numOfItemCollection +
            '/' +
            this.list.achatdbCollection._id +
            '/' +
            this.actualSlide,
        );
      } else {
        this.changeUrl(
          this.previousUrl +
            '/' +
            this.list.achatdbCollection._id +
            '/' +
            this.actualSlide,
        );
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
        confirmModalMessage: this.confirmModalMessage,
        confirmModalTitle: this.confirmModalTitle,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
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
    return this.prefix + imgName + ".jpg";
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
      this.changeUrl(
        this.previousUrl +
          '/' +
          this.numOfItemCollection +
          '/' +
          this.list.achatdbCollection._id +
          '/' +
          this.actualSlide,
      );
    } else {
      this.changeUrl(
        this.previousUrl + '/' + this.list.achatdbCollection._id + '/' + this.actualSlide,
      );
    }
  }

  public runLikeImage(achatdbCollection) {
    if (this.auth.isLoggedIn()) {
      let formData = new FormData();
      formData.append('achatdbCollection', JSON.stringify(achatdbCollection));

      let postedBy = this.auth.getLogUserId();
      this.subscriber = this.route.params.subscribe((params) => {
        this.http
          .post<any>(
            environment.urlAddress +
              '/api/v1/user_input/like/' +
              params.uid +
              '/' +
              postedBy,
            formData,
          )
          .subscribe((data: any) => {
            this.list.achatdbCollection.likes.quantity = data.likes.quantity;
          });
      });
    }
  }

  public ifLoginLikeImage(status) {
    if (this.imageInformation && this.auth.isLoggedIn() && 0 == status) {
      return true;
    }
    return false;
  }

  public ifLogoutLikeImage(status) {
    if (this.imageInformation && !this.auth.isLoggedIn() && 0 == status) {
      return true;
    }
    return false;
  }

  public ifLike(status) {
    if (this.imageInformation && 0 == status) {
      return true;
    }
    return false;
  }

  public ifLoginPriceBindImage(status) {
    if (this.imageInformation && this.auth.isLoggedIn() && 1 == status) {
      return true;
    }
    return false;
  }

  public ifLogoutPriceBindImage(status) {
    if (this.imageInformation && !this.auth.isLoggedIn() && 1 == status) {
      return true;
    }
    return false;
  }

  public ifPrice(status) {
    if (this.imageInformation && 1 == status) {
      return true;
    }
    return false;
  }

  public ifLoginAuctionBindImage(status) {
    if (this.imageInformation && this.auth.isLoggedIn() && 2 == status) {
      return true;
    }
    return false;
  }

  public ifLogoutAuctionBindImage(status) {
    if (this.imageInformation && !this.auth.isLoggedIn() && 2 == status) {
      return true;
    }
    return false;
  }

  public ifAuction(status) {
    if (this.imageInformation && 2 == status) {
      return true;
    }
    return false;
  }

  public sendOfferModal() {
    const initialState = {
      list: {
        achat_collection: this.list.achatdbCollection,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      AddOfferModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((data: any) => {
      this.list.achatdbCollection.price = data.new_price;
    });
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
    formData.append('mainImage', achatdbCollection._id);
    formData.append('newCommentText', this.newCommentText);

    let postedBy = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe((params) => {
      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/comment/' +
            params.uid +
            '/' +
            postedBy,
          formData,
        )
        .subscribe((data: any) => {
          this.list.achatdbCollection.communityComments.push(data.communityComment);
          this.textValue = '';
        });
    });
  }

  public deleteComment(achatdbCollection, communityComment) {
    let formData = new FormData();
    formData.append('mainImageId', achatdbCollection._id);
    formData.append('communityCommentId', communityComment._id);
    formData.append('communityCommentCommentBy', communityComment.commentBy);

    let postedBy = this.auth.getLogUserId();
    this.subscriber = this.route.params.subscribe((params) => {
      this.http
        .post<any>(
          environment.urlAddress +
            '/api/v1/user_input/deleteComment/' +
            params.uid +
            '/' +
            postedBy,
          formData,
        )
        .subscribe((data: any) => {
          this.list.achatdbCollection.communityComments =
            data.achatdbCollection.communityComments;
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
    } else {
      return false;
    }
  }

  private changeUrl(url) {
    if (this.list.dontUseUrl !== true) {
      this.location.go(url);
    }
  }

  public getCommentBtnClass(): string {
    if (0 === this.resizeSvc.getScreenSize()) {
      return 'btn btnComments btnComments_mobile';
    }
    return 'btn btnComments';
  }

  public getSubmitCommentBtnClass(): string {
    if (0 === this.resizeSvc.getScreenSize()) {
      return 'btn btnSubmitComment btnSubmitComment_mobile';
    }
    return 'btn btnSubmitComment';
  }

  public getCancleAddCommentBtnClass(): string {
    if (0 === this.resizeSvc.getScreenSize()) {
      return 'btn btnCancleAddComment btnCancleAddComment_mobile';
    }
    return 'btn btnCancleAddComment';
  }

  public getBtnAddComentColumn(): string {
    if (0 === this.resizeSvc.getScreenSize() || 1 === this.resizeSvc.getScreenSize()) {
      return 'col-5';
    }
    return 'col-3';
  }

  public getInputComentColumn(): string {
    if (0 === this.resizeSvc.getScreenSize() || 1 === this.resizeSvc.getScreenSize()) {
      return 'col-7';
    }
    return 'col-9';
  }

  public ifShowIndicators(): Boolean {
    if (this.imageInformation) {
      return true;
    }
    return false;
  }

  public getDateFormated(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
}
