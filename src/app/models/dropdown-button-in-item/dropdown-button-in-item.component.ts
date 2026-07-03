import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DropdownItem } from '../../services/dropdownButtonsInItem.service';

@Component({
    selector: 'app-dropdown-button-in-item',
    templateUrl: './dropdown-button-in-item.component.html',
    styleUrls: ['./dropdown-button-in-item.component.css'],
    standalone: false
})
export class DropdownButtonInItemComponent implements OnInit {
  @Input() item_collection: DropdownItem[] = [];
  @Input() img_dropdown_icon_moseout: String;
  @Input() img_dropdown_icon_moseover: String;
  @Input() img_dropdown_action: String;
  @Input() trigger_dropdown: EventEmitter<any>;

  @Output() img_dropdown_event: EventEmitter<any> = new EventEmitter();
  @Output() dropdown_action_event: EventEmitter<any> = new EventEmitter();
  @Output() img_dropdown_action_event: EventEmitter<any> = new EventEmitter();

  img_dropdown_icon: String;
  private eventsSubscription: any;
  navbarOpen = false;
  dropdownMenuClass: String = '';

  search_user: String;

  constructor() {}

  ngOnInit() {
    this.img_dropdown_icon = this.img_dropdown_icon_moseout;
    this.eventsSubscription = this.trigger_dropdown.subscribe((data) =>
      this.triggerDropdown(),
    );
  }

  public onImgDropdownIconClick() {
    this.img_dropdown_event.emit();
  }

  public onDropdownActionEventClick(item) {
    this.dropdown_action_event.emit(item);
  }

  public onImgDropdownActionEventClick(item) {
    this.img_dropdown_action_event.emit(item);
  }

  public triggerDropdown() {
    let element: HTMLElement = document.getElementById(
      'search_dropdown_togle',
    ) as HTMLElement;
    element.click();
  }
}
