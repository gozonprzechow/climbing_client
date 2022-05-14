import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputMineralFormComponent } from './input-mineral-form/input-mineral-form.component';
import { MondifyMineralFormComponent } from './mondify-mineral-form/mondify-mineral-form.component';
import { InputSubMineralFormComponent } from './input-sub-mineral-form/input-sub-mineral-form.component';
import { MondifySubMineralFormComponent } from './mondify-sub-mineral-form/mondify-sub-mineral-form.component';
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
    path: 'inputMineral',
    component: InputMineralFormComponent,
  },
  {
    path: 'modifyMineral',
    component: MondifyMineralFormComponent,
  },
  {
    path: 'inputSub-mineral',
    component: InputSubMineralFormComponent,
  },
  {
    path: 'modifySub-mineral',
    component: MondifySubMineralFormComponent,
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
    path: 'chat/:page/:idRecipient/:nameRecipient/:type',
    component: ChatFormComponent,
  },
  {
    path: 'locality/:uid/:page/:idPostedBy',
    component: UserLocalityFormComponent,
  },
  {
    path: 'locality/:uid/:page/:idPostedBy/:image/:slide',
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
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
