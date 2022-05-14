import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

export enum ChatStatus {
  kStandard,
  kPrice,
}

export interface MessagesWorkData {
  delete_message_array: any;
  delete_message_image_array: any;
}

@Injectable()
export class ChatService {
  constructor(public auth: AuthenticationService) {}

  public isItemYours(userId): Boolean {
    if (userId != this.auth.getLogUserId()) {
      return false;
    }
    return true;
  }

  public isDropDownActive(userId) {
    if (this.auth.isLoggedIn() && this.auth.getLogUserId() != userId) {
      return true;
    }
    return false;
  }

  public isSendMessageActive(userId): Boolean {
    if (!this.isItemYours(userId) && this.auth.isLoggedIn()) {
      return true;
    }
    return false;
  }

  public isAddFriendActive(otherUser): Boolean {
    if (
      !this.isItemYours(otherUser.postedBy) &&
      this.auth.isLoggedIn() &&
      !otherUser.requested_friend &&
      !otherUser.frienship_requester &&
      !otherUser.confirmed_friend
    ) {
      return true;
    }
    return false;
  }

  public isConfirmFriendActive(otherUser): Boolean {
    if (
      !this.isItemYours(otherUser.postedBy) &&
      otherUser.requested_friend &&
      this.auth.isLoggedIn() &&
      !otherUser.confirmed_friend
    ) {
      return true;
    }
    return false;
  }

  public isStandardChat(status: ChatStatus): Boolean {
    if (ChatStatus.kStandard == status) {
      return true;
    }
    return false;
  }

  public isPriceChat(status: ChatStatus): Boolean {
    if (ChatStatus.kPrice == status) {
      return true;
    }
    return false;
  }

  public fillDeleteMessageArrayNull(
    array_length,
    messages_work_data: MessagesWorkData,
  ): MessagesWorkData {
    for (let i = 0; i < array_length; i++) {
      messages_work_data.delete_message_array[i] = null;
    }
    return messages_work_data;
  }

  public fillDeleteMessageImageArrayDefault(
    array_length,
    messages_work_data: MessagesWorkData,
  ): MessagesWorkData {
    for (let i = 0; i < array_length; i++) {
      messages_work_data.delete_message_image_array[i] =
        '../../assets/skins/delete_message_checkbox.png';
    }
    return messages_work_data;
  }

  public toggleDeleteMessage(
    message_id,
    num_in_array,
    messages_work_data: MessagesWorkData,
  ): MessagesWorkData {
    if (messages_work_data.delete_message_array[num_in_array] == null) {
      messages_work_data.delete_message_array[num_in_array] = message_id;
      messages_work_data.delete_message_image_array[num_in_array] =
        '../../assets/skins/confirm_delete_message_checkbox.png';
    } else {
      messages_work_data.delete_message_array[num_in_array] = null;
      messages_work_data.delete_message_image_array[num_in_array] =
        '../../assets/skins/delete_message_checkbox.png';
    }
    return messages_work_data;
  }

  public isDeleteMessageActive(
    num_in_array,
    messages_work_data: MessagesWorkData,
  ): Boolean {
    if (messages_work_data.delete_message_array[num_in_array] == null) {
      return false;
    } else {
      return true;
    }
  }
}
