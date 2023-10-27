import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputRouteFormComponent } from './input-route-form/input-route-form.component';
import { MondifyRouteFormComponent } from './mondify-route-form/mondify-route-form.component';
import { InputPhotoFormComponent } from './input-photo-form/input-photo-form.component';
import { MondifyPhotoFormComponent } from './mondify-photo-form/mondify-photo-form.component';
import { InputLocalityFormComponent } from './input-locality-form/input-locality-form.component';
import { ModifyLocalityFormComponent } from './modify-locality-form/modify-locality-form.component';
import { UserMainLocalitiesFormComponent } from './user-main-localities-form/user-main-localities-form.component';
import { UserLocalityFormComponent } from './user-locality-form/user-locality-form.component';
import { CreateAccountFormComponent } from './create-account-form/create-account-form.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { SuccesCreateAccountFormComponent } from './create-account-form/succes-create-account-form/succes-create-account-form.component';
import { VerifiedCreateAccountFormComponent } from './verified-create-account-form/verified-create-account-form.component';
import { RecoverPasswordFormComponent } from './recover-password-form/recover-password-form.component';
import { ResetPasswordFormComponent } from './reset-password-form/reset-password-form.component';
import { OtherUsersFormComponent } from './other-users-form/other-users-form.component';
import { AdminHlavniFormComponent } from './admin-hlavni-form/admin-hlavni-form.component';
import { FirstPageFormComponent } from './first-page-form/first-page-form.component';
import { UserSettingsFormComponent } from './user-settings-form/user-settings-form.component';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { UserMapFormComponent } from './user-map-form/user-map-form.component';

const routes: Routes = [
  {
    path: '',
    component: FirstPageFormComponent,
  },
  {
    path: 'adminHlavni',
    component: AdminHlavniFormComponent,
  },
  {
    path: 'createAccount',
    component: CreateAccountFormComponent,
  },
  {
    path: 'createAccount/success',
    component: SuccesCreateAccountFormComponent,
  },
  {
    path: 'createAccount/verified/:uid',
    component: VerifiedCreateAccountFormComponent,
  },
  {
    path: 'recoverPassword',
    component: RecoverPasswordFormComponent,
  },
  {
    path: 'resetPassword/:uid',
    component: ResetPasswordFormComponent,
  },
  {
    path: 'login',
    component: LoginFormComponent,
  },
  {
    path: 'inputRoute',
    component: InputRouteFormComponent,
  },
  {
    path: 'modifyRoute',
    component: MondifyRouteFormComponent,
  },
  {
    path: 'inputPhoto',
    component: InputPhotoFormComponent,
  },
  {
    path: 'modifyPhoto',
    component: MondifyPhotoFormComponent,
  },
  {
    path: 'inputLocality',
    component: InputLocalityFormComponent,
  },
  {
    path: 'modifyLocality',
    component: ModifyLocalityFormComponent,
  },
  {
    path: 'userSettings',
    component: UserSettingsFormComponent,
  },
  {
    path: 'chat/:page/:type',
    component: ChatFormComponent,
  },
  {
    path: 'chat/:page/:idRecipient/:nameRecipient/:type', // nameRecipient string to hex
    component: ChatFormComponent,
  },
  {
    path: 'userMap/:idPostedBy/:country', // country string to hex
    component: UserMapFormComponent,
  },
  {
    path: 'userlocality/:uid/:page/:idPostedBy', // uid string to hex
    component: UserLocalityFormComponent,
  },
  {
    path: 'userlocality/:uid/:page/:idPostedBy/:image/:slide', // uid string to hex
    component: UserLocalityFormComponent,
  },
  {
    path: 'localities/:page/:idPostedBy',
    component: UserMainLocalitiesFormComponent,
  },
  {
    path: 'localities/:page/:idPostedBy/:localityNum/:image/:slide',
    component: UserMainLocalitiesFormComponent,
  },
  {
    path: 'localities/:page/:country/:region/:idPostedBy', // country and region string to hex
    component: UserMainLocalitiesFormComponent,
  },
  {
    path: 'localities/:page/:country/:region/:idPostedBy/:localityNum/:image/:slide', // country and region string to hex
    component: UserMainLocalitiesFormComponent,
  },
  {
    path: 'otherUsers/:page',
    component: OtherUsersFormComponent,
  },
  {
    path: 'otherUsers/:page/:userNum/:image/:slide',
    component: OtherUsersFormComponent,
  },
  {
    path: ':page/:image/:slide',
    component: FirstPageFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
