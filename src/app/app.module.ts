import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { Globals } from './services/globals.services';
import { AuthenticationService } from './services/authentication.service';
import { ModalDataInjector } from './services/modalDataInjector';
import { TokenInterceptor } from './services/token.interceptor.service';
import { RouterServices } from './services/router.services';
import { PagingButtonsServices } from './services/pagingButtons.service';
import { MathServices } from './services/math.service';
import { LanguageService } from './services/language.service';

import { ModalModule, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { InputMineralFormComponent } from './input-mineral-form/input-mineral-form.component';
import { UserMainLocalitiesFormComponent } from './user-main-localities-form/user-main-localities-form.component';
import { InputLocalityFormComponent } from './input-locality-form/input-locality-form.component';
import { UserLocalityFormComponent } from './user-locality-form/user-locality-form.component';
import { InputSubMineralFormComponent } from './input-sub-mineral-form/input-sub-mineral-form.component';
import { CreateAccountFormComponent } from './create-account-form/create-account-form.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { SuccesCreateAccountFormComponent } from './create-account-form/succes-create-account-form/succes-create-account-form.component';
import { VerifiedCreateAccountFormComponent } from './verified-create-account-form/verified-create-account-form.component';
import { RecoverPasswordFormComponent } from './recover-password-form/recover-password-form.component';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';
import { SuccesResetPasswordFormComponent } from './reset-password-form/succes-reset-password-form/succes-reset-password-form.component';
import { OtherUsersFormComponent } from './other-users-form/other-users-form.component';
import { AdminHlavniFormComponent } from './admin-hlavni-form/admin-hlavni-form.component';
import { FirstPageFormComponent } from './first-page-form/first-page-form.component';
import { UserSettingsFormComponent } from './user-settings-form/user-settings-form.component';
import { ChatFormComponent } from './chat-form/chat-form.component';

import { ConfirmModalComponent } from './models/confirm-modal/confirm-modal.component';
import { MainNavbarMenuComponent } from './models/main-navbar-menu/main-navbar-menu.component';
import { ImageModalComponent } from './models/image-modal/image-modal.component';
import { TittleMain } from './models/customTittle';
import { PagingButtonsComponent } from './models/paging-buttons/paging-buttons.component';

import { ModifyLocalityFormComponent } from './modify-locality-form/modify-locality-form.component';
import { MondifyMineralFormComponent } from './mondify-mineral-form/mondify-mineral-form.component';
import { MondifySubMineralFormComponent } from './mondify-sub-mineral-form/mondify-sub-mineral-form.component';

@NgModule({
  declarations: [
    AppComponent,
    InputMineralFormComponent,
    UserMainLocalitiesFormComponent,
    UserLocalityFormComponent,
    TittleMain,
    InputLocalityFormComponent,
    InputSubMineralFormComponent,
    CreateAccountFormComponent,
    LoginFormComponent,
    SuccesCreateAccountFormComponent,
    VerifiedCreateAccountFormComponent,
    RecoverPasswordFormComponent,
    ResetPasswordFormComponent,
    SuccesResetPasswordFormComponent,
    MainNavbarMenuComponent,
    OtherUsersFormComponent,
    ImageModalComponent,
    AdminHlavniFormComponent,
    MondifyMineralFormComponent,
    MondifySubMineralFormComponent,
    ConfirmModalComponent,
    ModifyLocalityFormComponent,
    FirstPageFormComponent,
    PagingButtonsComponent,
    UserSettingsFormComponent,
    ChatFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    NgbModule
  ],
  providers: [
    Globals,
    AuthenticationService,
    RouterServices,
    PagingButtonsServices,
    ModalDataInjector,
    MathServices,
    LanguageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
