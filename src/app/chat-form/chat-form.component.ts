import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { InputCondition } from '../models/inputLocality';
import { AuthenticationService, TokenPayload } from '../services/authentication.service';
import { Globals } from '../services/globals.services';
import { RouterServices } from '../services/router.services';
import { environment } from 'src/environments/environment';
import { LanguageService, TextTranslator } from '../services/language.service';
import { ConfirmModalComponent } from '../models/confirm-modal/confirm-modal.component';
import { ChatService, ChatStatus, MessagesWorkData } from '../services/chat.service';
import { Location } from '@angular/common';
import { ImageService } from '../services/image.service';
import { ImageModalComponent } from '../models/image-modal/image-modal.component';
import {
  ButtonCollection,
  PagingButtonsServices,
} from '../services/pagingButtons.service';
import { ResizeService, SCREEN_SIZE } from '../services/resize.service';
import { MobileService } from '../services/mobile.service';
import { MathServices } from '../services/math.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.css', './chat-form-mobile.component.css'],
})
export class ChatFormComponent implements OnInit {
  credentials: TokenPayload = {
    email: '',
    password: '',
  };

  kNumMessageOnPage: number = 14;

  submitted = false;
  showAddMessage: boolean = false;
  userForm: UntypedFormGroup;
  serviceErrors: any = {};
  serverServiceErrors: any = {};
  activePage: any = {};
  allLocality: any = [];
  confirmed_friends: any = [];
  successLoadCondition: string;
  inputCondition: InputCondition = new InputCondition();
  errorMessage: string;
  message: string;
  messageValue: string = '';
  title: string;
  my_name: string;
  recipient_id: string;
  actual_page: number;
  img_friend_dropdown: string;
  img_remove_friend: string;
  img_prize_chat = '../../assets/skins/insert_prize_collection.png';
  img_standard_chat = '../../assets/skins/insert_standard_collection.png';
  choosen_chat: ChatStatus = ChatStatus.kStandard;

  modalRef: BsModalRef;
  screen_size: SCREEN_SIZE;

  recipient: any = {};
  product: any = {};
  friends: any = [];
  alerts: any = {};

  chat_messages: any = [];
  bind_messages: any = [];
  pair_bind_messages: any = [];
  bind_message_achatDbCollection_ids: any = [];

  buttonCollections: ButtonCollection[] = [];
  standard_message_work_data: MessagesWorkData = {
    delete_message_array: [],
    delete_message_image_array: [],
  };
  binds_message_work_data: MessagesWorkData = {
    delete_message_array: [],
    pair_delete_message_array: [],
    achatDbCollections_array: [],
    delete_message_image_array: [],
  };
  pair_binds_message_data_worker;

  titleMain_txt: string;
  titleMainTranslation: TextTranslator = {
    cz: 'Zprávy s: ',
    en: 'Chat with: ',
  };
  registerQuestion_txt: string;
  registerQuestionTranslation: TextTranslator = {
    cz: 'Pokud nemáte účet mužete si ho založit zde:',
    en: 'If you are not register yet register here:',
  };
  register_txt: string;
  registerTranslation: TextTranslator = {
    cz: 'Registrace',
    en: 'Register',
  };
  password_txt: string;
  passwordTranslation: TextTranslator = {
    cz: 'Heslo',
    en: 'Password',
  };
  resendQuestion_txt: string;
  resendQuestionTranslation: TextTranslator = {
    cz: 'Pokud jste neobdrželi verifikační email klikněte zde pro znovuzaslání:',
    en: "If you doesn't receive verify email resend here:",
  };
  resend_txt: string;
  resendTranslation: TextTranslator = {
    cz: 'Znovuzaslání',
    en: 'Resend',
  };
  recoverQuestion_txt: string;
  recoverQuestionTranslation: TextTranslator = {
    cz: 'Pokud jse zapoměli heslo můžete si ho obnovit zde:',
    en: 'If you forget password recover password here:',
  };
  recover_txt: string;
  recoverTranslation: TextTranslator = {
    cz: 'Obnovit heslo',
    en: 'Recover password',
  };
  login_txt: string;
  loginTranslation: TextTranslator = {
    cz: 'Přihlásit',
    en: 'Login',
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

  deleteFriendModalMessage_txt: string;
  deleteFriendModalMessageTranslation: TextTranslator = {
    cz: 'Chcete smazat přítele?',
    en: 'Do you want delete friend?',
  };
  deleteFriendModalTitle_txt: string;
  deleteFriendModalTitleTranslation: TextTranslator = {
    cz: 'Smazat přítele',
    en: 'Delete friend',
  };

  private _serviceSubscription;
  somethink: any = {};

  constructor(
    public elementRef: ElementRef,
    public formBuilder: UntypedFormBuilder,
    public globals: Globals,
    public auth: AuthenticationService,
    public languageService: LanguageService,
    public modalService: BsModalService,
    public router: Router,
    public route: ActivatedRoute,
    public http: HttpClient,
    public routerService: RouterServices,
    public chatService: ChatService,
    private location: Location,
    public pagingButtons: PagingButtonsServices,
    public imageService: ImageService,
    public resizeSvc: ResizeService,
    public mobileService: MobileService,
    public mathServices: MathServices,
  ) {
    this.alerts.message_alert = false;
    this.alerts.price_alert = false;
    this.img_friend_dropdown = '../../assets/skins/drop_down.png';
    this.img_remove_friend = '../../assets/skins/remove_button.png';

    this.standard_message_work_data = this.chatService.fillDeleteMessageImageArrayDefault(
      this.kNumMessageOnPage,
      this.standard_message_work_data,
    );
    this.binds_message_work_data = this.chatService.fillDeleteMessageImageArrayDefault(
      this.kNumMessageOnPage,
      this.binds_message_work_data,
    );

    this.titleMain_txt = this.languageService.getNativeLanguageText(
      this.titleMainTranslation,
    );
    this.registerQuestion_txt = this.languageService.getNativeLanguageText(
      this.registerQuestionTranslation,
    );
    this.register_txt = this.languageService.getNativeLanguageText(
      this.registerTranslation,
    );
    this.password_txt = this.languageService.getNativeLanguageText(
      this.passwordTranslation,
    );
    this.resendQuestion_txt = this.languageService.getNativeLanguageText(
      this.resendQuestionTranslation,
    );
    this.resend_txt = this.languageService.getNativeLanguageText(this.resendTranslation);
    this.recoverQuestion_txt = this.languageService.getNativeLanguageText(
      this.recoverQuestionTranslation,
    );
    this.recover_txt = this.languageService.getNativeLanguageText(
      this.recoverTranslation,
    );
    this.login_txt = this.languageService.getNativeLanguageText(this.loginTranslation);
    this.addNew_txt = this.languageService.getNativeLanguageText(this.addNewTranslation);
    this.submit_txt = this.languageService.getNativeLanguageText(this.submitTranslation);
    this.cancle_txt = this.languageService.getNativeLanguageText(this.cancleTranslation);
    this.delete_txt = this.languageService.getNativeLanguageText(this.deleteTranslation);

    this.deleteFriendModalMessage_txt = this.languageService.getNativeLanguageText(
      this.deleteFriendModalMessageTranslation,
    );
    this.deleteFriendModalTitle_txt = this.languageService.getNativeLanguageText(
      this.deleteFriendModalTitleTranslation,
    );
  }

  public subscriber: any;

  public addFriendTrigger(res) {
    this.confirmed_friends.push(res.confirmed_friend);
  }

  copyServerErrors(returnData: any) {
    this.serverServiceErrors.email = returnData.inputErrorMessage.email;
    this.serverServiceErrors.password = returnData.inputErrorMessage.password;
    this.serverServiceErrors.uploadSuccess = returnData.inputErrorMessage.uploadSuccess;
  }

  cleanServerErrors() {
    this.serverServiceErrors.email = null;
    this.serverServiceErrors.password = null;
    this.serverServiceErrors.uploadSuccess = null;
  }

  ngOnInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#242020';
    this.resizeSvc.refreshScreenSize(window.innerWidth);
    let userId = this.auth.getLogUserId();
    this.recipient_id = userId;

    this.subscriber = this.route.params.subscribe((params) => {
      this.choosen_chat = params.type;
      if (undefined == params.idRecipient) {
        this.recipient = null;
      } else {
        this.recipient.id = params.idRecipient;
        this.recipient.name = this.mathServices.hexToString(params.nameRecipient);
        this.recipient_id = this.recipient.id;
        this.title = this.titleMain_txt + this.recipient.name;
      }

      this.actual_page = params.page;
      this.pagingButtons.setActualPage(this.actual_page);

      if (this.chatService.isPriceChat(this.choosen_chat)) {
        // console.log('Sem tu');
        this.getPriceChatHttp();
      } else {
        this.getStandardChatHttp();
      }
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeSvc.refreshScreenSize(window.innerWidth);
  }

  private getStandardChatHttp() {
    this.http
      .get(
        environment.urlAddress +
          '/api/v1/user_input/chat/' +
          this.pagingButtons.getActualPage() +
          '/' +
          this.recipient_id,
      )
      .subscribe(
        (returnData: any) => {
          this.pagingButtons.setNumOfPage(returnData.numberOfPages);
          this.standard_message_work_data = this.chatService.fillDeleteMessageArrayNull(
            this.kNumMessageOnPage,
            this.standard_message_work_data,
          );
          this.buttonCollections = this.pagingButtons.createButtonsField();
          if (returnData.chat_messages) {
            this.chat_messages = returnData.chat_messages;
          }
          this.friends = returnData.friends;
          this.confirmed_friends = returnData.friends.confirmed_friends;
          this.my_name = returnData.user_name;
          this.alerts = returnData.alerts;
        },
        (error) => {
          console.log(
            'There was an error generating the proper GUID on the server',
            error,
          );
        },
      );
  }

  private postStandardChatHttp() {
    let formData = new FormData();
    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/chat/' +
          this.pagingButtons.getActualPage() +
          '/' +
          this.recipient_id,
        formData,
      )
      .subscribe(
        (returnData: any) => {
          this.pagingButtons.setNumOfPage(returnData.numberOfPages);
          this.standard_message_work_data = this.chatService.fillDeleteMessageArrayNull(
            this.kNumMessageOnPage,
            this.standard_message_work_data,
          );
          this.buttonCollections = this.pagingButtons.createButtonsField();
          if (returnData.chat_messages) {
            this.chat_messages = returnData.chat_messages;
          }
          this.alerts = returnData.alerts;
        },
        (error) => {
          console.log(
            'There was an error generating the proper GUID on the server',
            error,
          );
        },
      );
  }

  private getPriceChatHttp() {
    this.http
      .get(
        environment.urlAddress +
          '/api/v1/user_input/priceChat/' +
          this.pagingButtons.getActualPage() +
          '/' +
          this.recipient_id,
      )
      .subscribe(
        (returnData: any) => {
          this.pagingButtons.setNumOfPage(returnData.numberOfPages);
          this.binds_message_work_data = this.chatService.fillDeleteMessageArrayNull(
            this.kNumMessageOnPage,
            this.binds_message_work_data,
          );
          this.buttonCollections = this.pagingButtons.createButtonsField();
          if (returnData.bind_messages) {
            this.bind_messages = returnData.bind_messages;
          }
          this.friends = returnData.friends;
          this.confirmed_friends = returnData.friends.confirmed_friends;
          this.my_name = returnData.user_name;
          this.alerts = returnData.alerts;
        },
        (error) => {
          console.log(
            'There was an error generating the proper GUID on the server',
            error,
          );
        },
      );
  }

  private postPriceChatHttp() {
    let formData = new FormData();
    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/priceChat/' +
          this.pagingButtons.getActualPage() +
          '/' +
          this.recipient_id,
        formData,
      )
      .subscribe(
        (returnData: any) => {
          this.pagingButtons.setNumOfPage(returnData.numberOfPages);
          this.binds_message_work_data = this.chatService.fillDeleteMessageArrayNull(
            this.kNumMessageOnPage,
            this.binds_message_work_data,
          );
          this.buttonCollections = this.pagingButtons.createButtonsField();
          if (returnData.bind_messages) {
            this.bind_messages = returnData.bind_messages;
          }
          this.alerts = returnData.alerts;
          // console.log(this.bind_messages);
        },
        (error) => {
          console.log(
            'There was an error generating the proper GUID on the server',
            error,
          );
        },
      );
  }

  clickPageButton(page: number): void {
    this.actual_page = page;
    this.pagingButtons.setActualPage(page);
    this.updateChatUrl();
    if (this.chatService.isStandardChat(this.choosen_chat)) {
      this.standard_message_work_data = this.chatService.fillDeleteMessageArrayNull(
        this.kNumMessageOnPage,
        this.standard_message_work_data,
      );
      this.standard_message_work_data =
        this.chatService.fillDeleteMessageImageArrayDefault(
          this.kNumMessageOnPage,
          this.standard_message_work_data,
        );
      this.postStandardChatHttp();
    } else if (this.chatService.isPriceChat(this.choosen_chat)) {
      this.binds_message_work_data = this.chatService.fillDeleteMessageArrayNull(
        this.kNumMessageOnPage,
        this.binds_message_work_data,
      );
      this.binds_message_work_data = this.chatService.fillDeleteMessageImageArrayDefault(
        this.kNumMessageOnPage,
        this.binds_message_work_data,
      );
      this.postPriceChatHttp();
    }
  }

  public toggleDeleteMessage(message_id, num_in_array) {}

  public isDeleteMessageActive(num_in_array) {
    return true;
  }

  public seeAddMessage() {
    this.showAddMessage = true;
  }

  public submitMessage() {
    let new_message_text = this.messageValue;
    let new_message_to = this.recipient_id;
    let formData = new FormData();
    formData.append('to_user', new_message_to);
    formData.append('new_message_text', new_message_text);

    let userId = this.auth.getLogUserId();

    this.http
      .post<any>(
        environment.urlAddress +
          '/api/v1/user_input/chatInputMessage/' +
          userId +
          '/' +
          this.recipient_id,
        formData,
      )
      .subscribe((returnData: any) => {
        this.updateChatUrl();
        this.pagingButtons.setNumOfPage(returnData.numberOfPages);
        this.pagingButtons.setActualPage(0);
        this.standard_message_work_data =
          this.chatService.fillDeleteMessageImageArrayDefault(
            this.kNumMessageOnPage,
            this.standard_message_work_data,
          );
        this.standard_message_work_data = this.chatService.fillDeleteMessageArrayNull(
          this.kNumMessageOnPage,
          this.standard_message_work_data,
        );
        this.buttonCollections = this.pagingButtons.createButtonsField();
        if (returnData.chat_messages) {
          this.chat_messages = returnData.chat_messages;
        }
        this.messageValue = '';
      });
  }

  notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }

  public deleteMessage() {
    let formData = new FormData();
    formData.append(
      'messages_list',
      JSON.stringify(
        this.standard_message_work_data.delete_message_array.filter(this.notEmpty),
      ),
    );
    formData.append('actual_page', JSON.stringify(this.actual_page));
    formData.append('recipient_id', this.recipient_id);

    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/deleteMessages', formData)
      .subscribe((returnData: any) => {
        if (returnData.numberOfPages % this.actual_page === 0 && 0 != this.actual_page) {
          this.actual_page--;
        }

        this.updateChatUrl();
        this.standard_message_work_data =
          this.chatService.fillDeleteMessageImageArrayDefault(
            this.kNumMessageOnPage,
            this.standard_message_work_data,
          );
        this.standard_message_work_data = this.chatService.fillDeleteMessageArrayNull(
          this.kNumMessageOnPage,
          this.standard_message_work_data,
        );
        this.pagingButtons.setNumOfPage(returnData.numberOfPages);
        this.pagingButtons.setActualPage(this.actual_page);
        this.buttonCollections = this.pagingButtons.createButtonsField();
        if (returnData.chat_messages) {
          this.chat_messages = returnData.chat_messages;
        }
      });
  }

  public deleteBindMessage() {
    let formData = new FormData();
    formData.append(
      'bind_list',
      JSON.stringify(
        this.binds_message_work_data.delete_message_array.filter(this.notEmpty),
      ),
    );
    formData.append(
      'achatDbCollection_list',
      JSON.stringify(
        this.binds_message_work_data.achatDbCollections_array.filter(this.notEmpty),
      ),
    );
    formData.append(
      'pair_bind_list',
      JSON.stringify(
        this.binds_message_work_data.pair_delete_message_array.filter(this.notEmpty),
      ),
    );
    formData.append('actual_page', JSON.stringify(this.actual_page));
    formData.append('recipient_id', this.recipient_id);
    // console.log(this.recipient_id);

    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/deleteBind', formData)
      .subscribe((returnData: any) => {
        if (returnData.numberOfPages % this.actual_page === 0 && 0 != this.actual_page) {
          this.actual_page--;
        }

        this.updateChatUrl();
        this.binds_message_work_data =
          this.chatService.fillDeleteMessageImageArrayDefault(
            this.kNumMessageOnPage,
            this.binds_message_work_data,
          );
        this.binds_message_work_data = this.chatService.fillDeleteMessageArrayNull(
          this.kNumMessageOnPage,
          this.binds_message_work_data,
        );
        this.pagingButtons.setNumOfPage(returnData.numberOfPages);
        this.pagingButtons.setActualPage(this.actual_page);
        this.buttonCollections = this.pagingButtons.createButtonsField();
        // console.log(returnData);
        if (returnData.bind_messages) {
          this.bind_messages = returnData.bind_messages;
        }
      });
  }

  public canceAddMessage() {
    this.showAddMessage = false;
  }

  public routeToChatWithUsers(name, id) {
    let recipient: any = {};
    if (id == this.auth.getLogUserId()) {
      recipient = null;
    } else {
      recipient.name = name;
      recipient.id = id;
    }
    this.routerService.chat(recipient, 0);
  }

  public routeToPriceChatWithUsers(name, id) {
    let recipient: any = {};
    if (id == this.auth.getLogUserId()) {
      recipient = null;
    } else {
      recipient.name = name;
      recipient.id = id;
    }
    this.routerService.chat(recipient, 0, 1);
  }

  public sendMessage(friend_name) {
    let recipient: any = {};
    recipient.name = friend_name.user_name;
    recipient.id = friend_name.user_id;
    this.routerService.chat(recipient, 0);
  }

  public openConfirmModal(friend_id, num_in_array) {
    const initialState = {
      list: {
        confirmModalMessage: this.deleteFriendModalMessage_txt,
        confirmModalTitle: this.deleteFriendModalTitle_txt,
        modalRef: BsModalRef,
      },
    };

    this.modalRef = this.modalService.show(
      ConfirmModalComponent,
      Object.assign({ animated: false }, { class: 'confirmModal' }, { initialState }),
    );
    this.modalRef.content.event.subscribe((res) => {
      this.deleteFriend(friend_id, num_in_array);
    });
  }

  public deleteFriend(friend_id, num_in_array) {
    let formData = new FormData();
    formData.append('friend_id', friend_id);

    this.http
      .post<any>(environment.urlAddress + '/api/v1/user_input/deleteFriend', formData)
      .subscribe((returnData: any) => {
        if (true == returnData.success_flag) {
          this.confirmed_friends.splice(num_in_array, 1);
        }
      });
  }

  public chooseStandardChat() {
    this.actual_page = 0;
    this.pagingButtons.setActualPage(this.actual_page);
    this.choosen_chat = ChatStatus.kStandard;
    this.updateChatUrl();
    this.postStandardChatHttp();
  }

  public ifShowStandardChatSwitch(): Boolean {
    if (this.chatService.isPriceChat(this.choosen_chat) && this.auth.isLoggedIn()) {
      return true;
    }
    return false;
  }

  public choosePriceChat() {
    this.actual_page = 0;
    this.pagingButtons.setActualPage(this.actual_page);
    this.choosen_chat = ChatStatus.kPrice;
    this.updateChatUrl();
    this.postPriceChatHttp();
  }

  public ifShowPrizeChatSwitch(): Boolean {
    if (this.chatService.isStandardChat(this.choosen_chat) && this.auth.isLoggedIn()) {
      return true;
    }
    return false;
  }

  private updateChatUrl(): void {
    let first_page_url;
    if (null != this.recipient_id && null != this.recipient) {
      first_page_url =
        'chat/' +
        this.actual_page +
        '/' +
        this.recipient_id +
        '/' +
        this.recipient.name +
        '/' +
        this.choosen_chat;
    } else {
      first_page_url = 'chat/' + this.actual_page + '/' + this.choosen_chat;
    }
    this.location.go(first_page_url);
  }

  openModal(achatdbCollection) {
    const initialState = {
      list: {
        achatdbCollection: achatdbCollection,
        previousUrl: null,
        numOfItemCollection: '',
        dontUseUrl: true,
      },
    };

    this.modalRef = this.modalService.show(
      ImageModalComponent,
      Object.assign(
        { animated: false },
        { class: 'mineralImageModal' },
        { initialState },
      ),
    );
  }

  public getSubmitMessageBtnClass(): string {
    if (0 === this.resizeSvc.getScreenSize()) {
      return 'btn btnSubmitMessage btnSubmitMessage_mobile';
    }
    return 'btn btnSubmitMessage';
  }

  public getCancleAddMessageBtnClass(): string {
    if (0 === this.resizeSvc.getScreenSize()) {
      return 'btn btnCancleAddMessage btnCancleAddMessage_mobile';
    }
    return 'btn btnCancleAddMessage';
  }

  public getBtnAddMessageColumn(): string {
    if (0 === this.resizeSvc.getScreenSize() || 1 === this.resizeSvc.getScreenSize()) {
      return 'col-5';
    }
    return 'col-3';
  }

  public getInputMessageColumn(): string {
    if (0 === this.resizeSvc.getScreenSize() || 1 === this.resizeSvc.getScreenSize()) {
      return 'col-7';
    }
    return 'col-9';
  }
}
