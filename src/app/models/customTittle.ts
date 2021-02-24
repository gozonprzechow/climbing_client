import { Component, Input } from '@angular/core';

@Component({
    selector: 'custom-tittle-main',
    template: `
    <div class="jumbotron bg-secondary">
        <div class="container bg-secondary">
            <div class="mainJumbotron">
                <h1 class="display-3 customTittle">{{tittleMain}}</h1>
            </div>
        </div>
    </div>`,
    styleUrls: ['./customTittle.css']
  })
  
  export class TittleMain {
    @Input() tittleMain: any = {};
  }