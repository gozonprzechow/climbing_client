import { Component, OnInit } from '@angular/core';
import { RouterServices } from '../services/router.services';

@Component({
  selector: 'app-first-page-form',
  templateUrl: './first-page-form.component.html',
  styleUrls: ['./first-page-form.component.css']
})
export class FirstPageFormComponent implements OnInit {

  constructor(
    public routerService: RouterServices
  ) { }

  ngOnInit(): void {
    this.routerService.otherUsers(0);
  }

}
