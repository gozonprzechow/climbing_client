import { Injectable } from '@angular/core';

export interface DropdownItem {
    item_text: string;
    num_in_array: number;
    button_visibility?: boolean;
    other_custom_data: any;
  }