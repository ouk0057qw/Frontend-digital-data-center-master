import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PersonsService } from '../../shared/services/persons.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { ProgramService } from '../../shared/services/program.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HomeModalComponent } from './home-modal/home-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UsersService } from '../../shared/services/users.service';
import { AuthlogService } from '../../shared/services/authlog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public page: Number;
  public personList: any = [];
  public addressList: any = [];
  public organizationList: any = [];
  public programList: any = [];

  public tempPersonList: any = [];

  public typeCheck = [];

  public listStatus = null;
  public noData: boolean = null;
  public inputSearch = '';
  ipAddress: any;
  constructor(
    private spinner: NgxSpinnerService,
    private personsService: PersonsService,
    private organizationService: OrganizationService,
    private programService: ProgramService,
    private modalService: NgbModal,
    private usersService: UsersService,
    private http: HttpClient,
    private authlogService: AuthlogService,

  ) {
    this.typeCheck = this.setTypeCheck();
    this.http.get<{ ip: string }>('https://jsonip.com').subscribe(data => { this.ipAddress = data });
  }

  async ngOnInit() {

    this.spinner.show();

    //console.log(this.usersService.getUserInfo().email);
    this.typeCheck = this.setTypeCheck();
    this.noData = false;
    this.spinner.hide();
    this.hasAuthorize();
  }

  private hasAuthorize() {
    if (this.usersService.getLocalUserPermission().length == 0) {
      this.modalService.open(HomeModalComponent, { size: 'sm' });
    }
  }

  public openModal(content, size) {
    this.modalService.open(content, { size: size });
  }

  public mapPersonAddress(persons) {
    persons.map(async person => {
      person.PersonAddress = [];
      const address = (await this.personsService.getAddressById(person.PersonId).toPromise()).data;
      person.PersonAddress = address.length > 0 ? address : [];
    });
    return persons;
  }

  public mapPerson(personList) {
    personList.map(async data => {
      data.PersonAddress = [];
      const title = data.TitleNameTh == 1 ? 'นาย' : data.TitleNameTh == 2 ? 'นางสาว' : 'นาง';
      const titleOrther = await data.TitleNameOther != '' && data.TitleNameOther != null ? data.TitleNameOther : title;
      const first = data.FristNameTh;
      const last = data.LastNameTh;

      const titleEn = data.TitleNameEn == 1 ? 'Mr.' : data.TitleNameEn == 2 ? 'Mrs.' : 'Miss.';
      const titleOrtherEn = await data.TitleNameOther != '' && data.TitleNameOther != null ? data.TitleNameOther : titleEn;

      const firstEn = data.FristNameEn;
      const lastEn = data.LastNameEn;

      const workperson = (await this.personsService.getworkperson(data.PersonId).toPromise()).data;
      const workcontact = (await this.personsService.getcontactperson(data.PersonId).toPromise()).data;

      data.FullnameTh = first && last ? titleOrther + first + ' ' + last : '';
      data.FullnameEn = firstEn && lastEn ? titleOrtherEn + firstEn + ' ' + lastEn : '';
      data.ContactList = workcontact;
      data.PositionList = workperson;

      const address = (await this.personsService.getAddressById(data.PersonId).toPromise()).data;
      data.PersonAddress = address.length > 0 ? address : [];
    });
    return personList;
  }
  public mapCorperation(corperationList) {
    corperationList.map(async data => {
      data.CorporationAddress = [];

      const CorporationContact = (await this.organizationService.getserchcorporationcontact(data.CorporationId).toPromise()).data;
      const CorporationAddress = (await this.organizationService.getserchcorporationaddress(data.CorporationId).toPromise()).data;
      const ParentName = ((await this.organizationService.getCorporation(data.ParentId).toPromise()).data[0]).CorporationName;

      data.ParentName = ParentName;
      data.CorporationContactList = CorporationContact;
      data.CorporationAddressList = CorporationAddress;

    });
    return corperationList;
  }

  public mapProject(projectList) {
    projectList.map(async data => {

      const title = data.TitleNameTh == 1 ? 'นาย' : data.TitleNameTh == 2 ? 'นางสาว' : 'นาง';
      const first = data.FristNameTh;
      const last = data.LastNameTh;

      data.FullnameTh = first && last ? title + first + ' ' + last : '';
    });
    return projectList;
  }

  private setTypeCheck() {
    let checkedPerson = this.canSelect('บุคคล');
    let checkedOrganize = this.canSelect('องค์กร');
    let checkedProgram = this.canSelect('โครงการ');

    if (checkedPerson) {
      checkedOrganize = false;
      checkedProgram = false;
    } else if (checkedOrganize) {
      checkedProgram = false;
    }

    return [
      { name: 'บุคคล', status: checkedPerson },
      { name: 'องค์กร', status: checkedOrganize },
      { name: 'โครงการ', status: checkedProgram },
    ];
  }

  public async onSearchData() {
    this.spinner.show();
    const options = {
      keys: [{
        name: '',
      }, {
        name: 'author',
      }]
    };
    if (this.typeCheck[0].status === true) {
      this.personList = await this.mapPerson((await this.personsService.getallperson().toPromise()).data);
      this.listStatus = 0;
      if (this.inputSearch != '') {
        const seachPerson = this.personList.filter(person => {
          const title = person.TitleNameTh == 1 ? 'นาย' : person.TitleNameTh == 2 ? 'นางสาว' : 'นาง';
          const titleOrther = person.TitleNameOther != '' && person.TitleNameOther != null ? person.TitleNameOther : title;
          const titleEn = person.TitleNameEn == 1 ? 'Mr.' : person.TitleNameEn == 2 ? 'Mrs.' : 'Miss.';
          const titleOrtherEn = person.TitleNameOther != '' && person.TitleNameOther != null ? person.TitleNameOther : titleEn;
          return (String(person.FristNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(title + person.FristNameTh + ' ' + person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(titleOrther + person.FristNameTh + ' ' + person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(titleEn + person.FristNameTh + ' ' + person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(titleOrtherEn + person.FristNameTh + ' ' + person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(person.FristNameTh + ' ' + person.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase());
        });
        this.personList = seachPerson.length > 0 ? seachPerson : await this.mapPerson((await this.personsService.getsearchpersoncontact(this.inputSearch).toPromise()).data);
        if (this.personList !== null && this.personList.length == 0) {
          this.noData = true;
        } else {
          this.noData = false;
        }
      }
       this.updateLog1(this.inputSearch);
    } else if (this.typeCheck[1].status == true) {
      this.listStatus = 1;
      this.organizationList = this.mapCorperation((await this.organizationService.getOrganizationAll().toPromise()).data);
      if (this.inputSearch != '') {
        this.organizationList = this.organizationList.filter(corperation => {
          return (String(corperation.CorporationName).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(corperation.TaxNo).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase());
        });
      }
      this.updateLog2(this.inputSearch);
    } else if (this.typeCheck[2].status == true) {
      this.listStatus = 2;
      this.programList = this.mapProject((await this.programService.getallproject().toPromise()).data);
      Array.prototype.push.apply(this.programList, this.mapProject((await this.programService.getallpurchase().toPromise()).data));
      if (this.inputSearch != '') {
        this.programList = this.programList.filter(project => {
          return (String(project.CorporationName).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(project.ProjectName).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(project.FristNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(project.LastNameTh).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(project.ProjectNo).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase()) ||
            (String(project.PurchaseNo).toLocaleLowerCase()).includes(this.inputSearch.toLocaleLowerCase());
        });
      }
      this.updateLog3(this.inputSearch);
    }
    this.spinner.hide();
    return this.page = 1;
  }

  public onSelectedType(i, value) {
    if (value.status) {
      value.status = false;
    } else {
      value.status = true;
      for (let index = 0; index < this.typeCheck.length; index++) {
        // tslint:disable-next-line:triple-equals
        if (i != index) {
          this.typeCheck[index].status = false;
        }
      }
    }
  }

  canSearch() {
    return this.usersService.canView('/persons') || this.usersService.canView('/organizations') || this.usersService.canView('/program');
  }

  canSelect(menuNameTH) {
    if (menuNameTH == 'บุคคล') {
      return this.usersService.canView('/persons');
    } else if (menuNameTH == 'องค์กร') {
      return this.usersService.canView('/organizations');
    } else if (menuNameTH == 'โครงการ') {
      return this.usersService.canView('/program');
    }
    return false;
  }


  async updateLog1(inputSearch) {
    var menu = 'ค้นหาข้อมูลบุคคล';
    await this.auditLogService(inputSearch, menu, '', this.ipAddress)
  }
  async updateLog2(inputSearch) {
    var menu = 'ค้นหาข้อมูลองค์กร';
    await this.auditLogService(inputSearch, menu, '', this.ipAddress)
  }
  async updateLog3(inputSearch) {
    var menu = 'ค้นหาข้อมูลโครงการ';
    await this.auditLogService(inputSearch, menu, '', this.ipAddress)
  }
  async auditLogService(field, menu, origin, ipAddress) {
    await this.authlogService.insertAuditlog({
      UpdateDate: new Date(),
      UpdateMenu: menu,
      UpdateField: field,
      DataOriginal: origin,
      IpAddress: ipAddress.ip
    }).toPromise()
  }
}
