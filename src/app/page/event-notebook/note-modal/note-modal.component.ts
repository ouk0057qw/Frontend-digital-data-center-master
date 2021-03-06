import { Component, EventEmitter, OnInit, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import { PersonsService } from '../../../shared/services/persons.service';

import { validForm } from '../../../shared/library/form';
import { HttpClient } from '@angular/common/http';
import { AuthlogService } from "../../../shared/services/authlog.service";
@Component({
  selector: 'event-note-modal',
  templateUrl: './note-modal.component.html',
  styleUrls: ['./note-modal.component.css']
})

export class NoteModalComponent implements OnInit {

  public title = "";
  ipAddress: any;
  public personList: any = [];

  public alertValid = false
  public noteForm: FormGroup;

  public dropdownSettings = {
    singleSelection: true,
    idField: 'PersonId',
    textField: 'FullnameTh',
    allowSearchFilter: true
  };

  @Input() data: any;

  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private modalService: NgbModal,
    private personsService: PersonsService,
    private formBuilder: FormBuilder,
    private authlogService: AuthlogService,
    private http: HttpClient
  ) {
    this.noteForm = this.setNote(null)
    this.http.get<{ ip: string }>('https://jsonip.com').subscribe(data => { this.ipAddress = data })
  }

  async ngOnInit() {
    this.title = this.data ? "แก้ไขบันทึก" : "เพิ่มบันทึกใหม่"
    this.personList = this.mapPersons((await this.personsService.getallperson().toPromise()).data)
    this.noteForm = this.data ? this.setNote(this.data) : this.setNote(null)
  }

  public mapPersons(personList) {
    personList.map(data => {
      let title = data.TitleNameTh == 1 ? 'นาย' : data.TitleNameTh == 2 ? 'นาง' : 'นางสาว'
      let first = data.FristNameTh
      let last = data.LastNameTh

      data.FullnameTh = first && last ? title + first + ' ' + last : ''

    });
    return personList
  }

  // public mapPersonAddress(persons) {
  //   persons.map(async person => {
  //     person.PersonAddress = []
  //     let address = (await this.personsService.getAddressById(person.PersonId).toPromise()).data
  //     person.PersonAddress = address.length > 0 ? address : []
  //   });
  //   return persons
  // }

  public showAddress(value) {
    let Building = value.Building ? "อาคาร " + value.Building + " " : ""
    let Floor = value.Floor ? "ชั้น " + value.Floor + " " : ""
    let HouseNo = value.HouseNo ? "เลขที่ " + value.HouseNo + " " : ""
    let Road = value.Road ? "ถนน " + value.Road + " " : ""
    let Soi = value.Soi ? "ซอย " + value.Soi + " " : ""
    let Subdistrict = value.Subdistrict ? "ตำบล/แขวง " + value.Subdistrict + " " : ""
    let District = value.District ? "อำเภอ/เขต " + value.District + " " : ""
    return Building + Floor + HouseNo + Road + Soi + Subdistrict + District
  }

  submit() {
    if (validForm(this.noteForm).length > 0) {
      this.alertValid = true;
      return;
    }
    let model: any = {
      PersonId: this.noteForm.value.Person[0].PersonId,
      Person: this.noteForm.value.Person[0].PersonId,
      NoteName: this.noteForm.value.NoteName,
      Description: this.noteForm.value.Description,
    }
    this.data ? model.NoteId = this.data.NoteId : null
    this.onSubmit.emit(model)
     this.updateLog(model);
    return this.modalService.dismissAll()
  }

  public closeModal() {
    Swal.fire({
      title: '',
      text: 'ต้องการบันทึกข้อมูลหรือไม่',
      type: 'warning',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then(async result => {
      if (result.value) {
        this.submit();
      }
      else {
        this.modalService.dismissAll()
      }
    });



  }

  public setNote(data) {
    return data ? this.formBuilder.group({
      CreateDate: [data.CreateDate],
      NoteId: [data.NoteId],
      Person: [[{ PersonId: data.PersonId, FullnameTh: data.FullnameTh, AddressPerson: data }]],
      NoteName: [data.NoteName, [Validators.required]],
      Description: [data.Description, [Validators.required]],
    }) : this.formBuilder.group({
      Person: [[]],
      NoteName: ["", [Validators.required]],
      Description: ["", [Validators.required]],
    })
  }

  async updateLog(note) {

    await this.auditLogService(
      "ชื่อบันทึก",
      "",
      note.NoteName,
      this.ipAddress
    )
    await this.auditLogService(
      "รายละเอียด",
      "",
      note.Description,
      this.ipAddress
    )

  }
  async auditLogService(field, origin, update, ipAddress) {
    await this.authlogService
      .insertAuditlog({
        UpdateDate: new Date(),
        UpdateMenu: "พเิ่ม/แก้ไข สมุดบันทึก",
        UpdateField: field,
        DataOriginal: origin,
        UpdateData: update,
        IpAddress: ipAddress.ip
      })
      .toPromise();
  }

}
