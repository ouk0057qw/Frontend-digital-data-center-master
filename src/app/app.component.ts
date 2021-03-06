import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { NgbModalConfig, NgbModal, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { NgModule } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit, OnInit {
  private cookieValue: string;

  constructor(
    private configDate: NgbDatepickerConfig,
    private config: NgbModalConfig,
    private modalService: NgbModal,
    private elementRef: ElementRef,
    private cookieService: CookieService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    // configDate.minDate = {year: 2500, month: 1, day: 1};
    // configDate.maxDate = {year: 2699, month: 12, day: 31};
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = 'white';
  }

}
