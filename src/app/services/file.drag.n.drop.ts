import { Directive, HostListener, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Directive({
    selector: '[fileDragDrop]',
    standalone: false
})

export class FileDragNDrop {
  //@Input() private allowed_extensions : Array<string> = ['png', 'jpg', 'bmp'];
  @Output() private filesChangeEmiter : EventEmitter<FileList> = new EventEmitter();
  //@Output() private filesInvalidEmiter : EventEmitter<File[]> = new EventEmitter();
  @HostBinding('style.background') private background = '#eee';
  @HostBinding('style.border') private borderStyle = '2px dashed';
  @HostBinding('style.border-color') private borderColor = '#3088CF';
  @HostBinding('style.border-radius') private borderRadius = '5px';

  constructor() { }

  @HostListener('dragover', ['$event']) public onDragOver(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'lightgray';
    this.borderColor = '#3088CF !important';
    this.borderStyle = '3px solid';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
    this.borderColor = '#3088CF';
    this.borderStyle = '2px dashed';
  }

  @HostListener('drop', ['$event']) public onDrop(evt){
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#eee';
    this.borderColor = '#3088CF';
    this.borderStyle = '2px dashed';
    let files = evt.dataTransfer.files;
    let valid_files : Array<File> = files;
    this.filesChangeEmiter.emit(files);
  }
}