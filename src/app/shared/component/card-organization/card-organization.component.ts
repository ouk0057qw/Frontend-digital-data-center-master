import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { OrganizationService } from '../../services/organization.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'card-organization',
  templateUrl: './card-organization.component.html',
  styleUrls: ['./card-organization.component.css']
})
export class CardOrganizationComponent implements OnInit {

  public isCollapsed = true;

  public currentPath = '';

  public headerTable: any = ['รหัสโครงการ', 'ชื่อโครงการ', 'ที่อยู่จัดส่งเอกสาร'];
  public organizationProject: any = [];

  public organizationContact: any = [];

  dataTable: any = [];

  public canEditOrganization = false;
  public canDeleteOrganization = false;

  @Input() data: any;

  @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private usersService: UsersService,
  ) { }

  async ngOnInit() {
    this.currentPath = this.router.url;
    this.data.CorporationId ? this.setContact((await this.organizationService.getcorporationcontact(this.data.CorporationId).toPromise()).data) : null;
    this.organizationProject = this.data.CorporationId ? (await this.organizationService.getCorporation(this.data.CorporationId).toPromise()).data : [];
    this.dataTable = this.data.CorporationId ? this.setTable((await this.organizationService.getCorporationProject(this.data.CorporationId).toPromise()).data) : [];
    this.canEditOrganization = this.usersService.canEditOrganization();
    this.canDeleteOrganization = this.usersService.canDeleteOrganization();
  }

  setContact(list) {
    for (let index = 0; index < list.length; index++) {
      if (list[index].TypeContactId == '2') { this.organizationContact.push(list[index]); }
    }
  }

  deleteCorporation(data) {
    this.onDelete.emit(data);
  }

  setTable(corperationList) {
    const list = [];
    corperationList.forEach(async element => {
      list.push({
        ProjectNo: element.ProjectNo,
        ProjectName: element.ProjectName,
        Address: this.showAddress(((await this.organizationService.getcorporationaddress(element.CorporationId).toPromise()).data)[0])
      });
    });
    return list;
  }
  public showAddress(value) {
    if(!value) return;
    const Building = value.Building ? 'อาคาร ' + value.Building + ' ' : '';
    const Floor = value.Floor ? 'ชั้น ' + value.Floor + ' ' : '';
    const Room = value.Room ? 'ห้อง ' + value.Room + ' ' : '';
    const HouseNumber = value.HouseNumber ? 'เลขที่ ' + value.HouseNumber + ' ' : '';
    const Road = value.Road ? 'ถนน ' + value.Road + ' ' : '';
    const Soi = value.Soi ? 'ซอย ' + value.Soi + ' ' : '';
    const Province = value.Province != '' ? 'จังหวัด ' + value.Province + ' ' : '';

    if (value.Province == 'กรุงเทพมหานคร') {
      const Subdistrict = value.Subdistrict != '' ? 'แขวง ' + value.Subdistrict + ' ' : '';
      const District = value.District != '' ? 'เขต ' + value.District + ' ' : '';
      const Zipcode = value.Zipcode != '' ? 'รหัสไปรษณีย์ ' + value.Zipcode + ' ' : '';
      return Building + Floor + Room + HouseNumber + Road + Soi + Subdistrict + District + Province + Zipcode;
    } else {
      const Subdistrict = value.Subdistrict != '' ? 'ตำบล ' + value.Subdistrict + ' ' : '';
      const District = value.District != '' ? 'อำเภอ ' + value.District + ' ' : '';
      const Zipcode = value.Zipcode != '' ? 'รหัสไปรษณีย์ ' + value.Zipcode + ' ' : '';
      return Building + Floor + Room + HouseNumber + Road + Soi + Subdistrict + District + Province + Zipcode;
    }
  }


  canEdit(checkNext = null) {
    /*
    var ret = this.usersService.canEdit()
    if (ret){
      if (checkNext !== null)
        return checkNext;
    }
    return ret;
    */
    if (checkNext !== null) {
      return checkNext;
    }
    return this.canEditOrganization;
  }
}
