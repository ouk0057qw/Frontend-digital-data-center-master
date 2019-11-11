import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  //templateUrl: './login.component.html',
  template: '',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public alertUser = false;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private cookieService: CookieService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.cookieService.get('code') != '') {
      //console.log('current tokent:' + this.cookieService.get('code'));
      // redirect to sso authen page home
      document.location.href = "/#/home";
    } else {
      this.callback();
    }
  }

  private callback() {
    // debugger
    var url = new URL(document.location.href);
    var code = url.searchParams.get("code");
    var error = url.searchParams.get("error");

    if (typeof code !== 'undefined' && code != null) { // Logon
      this.cookieService.set('code', code);
      document.location.href = "/#/home";
    } else if (typeof error !== 'undefined' && error != null) { // Error access_denined, logout
      alert(error);
      this.cookieService.delete('code');
      document.location.href = environment.logoutUrl
    } else { // Reqest login
      document.location.href = environment.ssoAuthUrl
        .replace("$redirect_uri", environment.redirect_uri)
        .replace("$client_id", environment.client_id);
    }

    this.setPermission();
  }

  public openModal(content) {
    return this.modalService.open(content);
  }

  private setPermission() {
    const mockPermission = '{ "successful": true, "data": [ { "PView": 1, "MenuName": "ข้อมูลบุคคล", "MenuNameEng": "persons" } ] }';
    this.cookieService.set('u_permission', mockPermission);
  }
}
