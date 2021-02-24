import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonCollection } from '../../services/pagingButtons.service';

@Component({
  selector: 'app-paging-buttons',
  templateUrl: './paging-buttons.component.html',
  styleUrls: ['./paging-buttons.component.css']
})
export class PagingButtonsComponent {
  @Input() buttonCollections: ButtonCollection[] = [];
  @Output() clickPageButtonEvent = new EventEmitter<number>();

  numPageButtons: number;

  constructor() { }

  clickPageButton(page: number): void {
    this.clickPageButtonEvent.emit(page);
  }
}
