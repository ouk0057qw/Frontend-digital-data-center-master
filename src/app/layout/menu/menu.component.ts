import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  private userPermission = [];
  constructor(private usersService: UsersService) { }

  ngOnInit() {
    try {
      this.userPermission = this.usersService.getLocalUserPermission();
    } catch (error) {
      console.log('error while get userPermission:', error);
    }

  }
  showMenu(menuNameEng) {
    return true;
    // { "PersonId": 5, "PView": 1, "PAdd": 1, "PEdit": 1, "PDelete": 1, "Import": 1, "Export": 1, "MenuId": 1, "MenuName": "หน้าแรก", "MenuNameEn": "home" }
    for (var i = 0; i < this.userPermission.length; i++) {
      if (menuNameEng == this.userPermission[i].MenuNameEn && this.userPermission[i].PView == 1) {
        return true;
      }
    }
    return false;
  }

  canView(url, checkNext = null){
    var ret = this.usersService.canView(url)
    if (ret){
      if (checkNext !== null)
        return checkNext;
    }
    return ret;
  }

  canViewReport(){
    return this.canView('/report/searching-personal') || this.canView('/report/searching-corperation') 
    || this.canView('/report/searching-board') || this.canView('/report/using') || this.canView('/report/note')
  }

  canViewEvent(){
    return this.canView('/event/notebook') || this.canView('/event/group')
  }

  canViewSetting(){
    return this.canView('/setting/users') || this.canView('/setting/permission')
    || this.canView('/setting/auditlog') || this.canView('/setting/license')
  }

}
