import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private cookieService: CookieService) { }

  ngOnInit() {
  }

  logout(){
    // debugger
    this.cookieService.delete('code');
    this.cookieService.delete('u_permission');
    document.location.href = environment.logoutUrl
  }

}
