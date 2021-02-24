import { Injectable } from '@angular/core';
import {Subject} from 'rxjs'; 

    @Injectable()
    export class ModalDataInjector {
      invokeMineralImageModelEvent: Subject<any> = new Subject(); 

      callMineralImageModal(achatdbCollection) { 
        this.invokeMineralImageModelEvent.next(achatdbCollection); 
      }
    }