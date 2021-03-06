import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PersonsService } from '../../../shared/services/persons.service';
import SimpleCrypto from "simple-crypto-js/build/SimpleCrypto";

@Component({
  selector: 'persons-working',
  templateUrl: './persons-working.component.html',
  styleUrls: ['./persons-working.component.css']
})
export class PersonsWorkingComponent implements OnInit {

  public personId =""

  public stepList: any = [];

  public workingPerson: any = [];
  public workingCorporation: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private personsService: PersonsService
  ) {
    this.setMenubar();
  }

  async ngOnInit() {
    let Crypto = new SimpleCrypto('some-unique-key');
    this.personId = String(Crypto.decrypt(decodeURIComponent(this.activatedRoute.snapshot.paramMap.get('id'))));
    this.workingPerson = (await this.personsService.getWorkingById(this.personId).toPromise()).data
    this.workingCorporation = (await this.personsService.getworkperson(this.personId).toPromise()).data
  }

  private setMenubar() {
    this.personId = this.activatedRoute.snapshot.paramMap.get('id')
    this.stepList = [
      { icon: "profile", stepName: "ข้อมูลส่วนตัว", path: "/persons/detail/" + this.personId },
      { icon: "family", stepName: "ครอบครัว", path: "/persons/family/" + this.personId },
      { icon: "working", stepName: "การทำงาน", path: "/persons/working/" + this.personId },
      { icon: "capital", stepName: "การรับทุน", path: "/persons/bursary/" + this.personId },
      { icon: "Asset 36", stepName: "การศึกษา", path: "/persons/studies/" + this.personId },
    ]
  }
}
