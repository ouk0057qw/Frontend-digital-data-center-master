import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { validForm } from '../../../shared/library/form';

import { DropdownService } from '../../../shared/services/dropdown.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'modal-history-of-education',
  templateUrl: './modal-history-of-education.component.html',
  styleUrls: ['./modal-history-of-education.component.css']
})
export class ModalHistoryOfEducationComponent implements OnInit {

  @Input() data: any;

  @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();

  public dropdownSettings = {
    singleSelection: true,
    idField: 'AcademyId',
    textField: 'Academy',
    allowSearchFilter: true
  };

  public academyList = [];

  public alertValid = false;
  public educationForm: FormGroup;

  public Academy;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private dropdownService: DropdownService
  ) {
    this.educationForm = this.setEducation(null);
  }

  async ngOnInit() {
    this.academyList = (await this.dropdownService.getacademyAll().toPromise()).data;
    this.educationForm = this.data ? this.setEducation(this.data) : this.setEducation(null);
    //this.data ? this.educationForm.controls['AcademyId'].setValue([this.findAcademy(this.educationForm.controls['AcademyId'].value)]) : null;
  }

  findAcademy(academyId) {
    const result = this.academyList.find(data => {
      return data.AcademyId == academyId;
    });
    return {
      AcademyId: result.AcademyId,
      Academy: result.Academy,
    };
  }

  private setEducation(data) {
    return data ? this.formBuilder.group({
      Degree: [data.Degree, [Validators.required]],
      GraduationYear: [data.GraduationYear, [Validators.required]],
      Major: [data.Major, [Validators.required]],
      AcademyId: [data.AcademyId, [Validators.required]],
      EducationId: [data.EducationId]
    })
      : this.formBuilder.group({
        Degree: [1, [Validators.required]],
        GraduationYear: ['', [Validators.required]],
        Major: ['', [Validators.required]],
        AcademyId: [null, [Validators.required]],
      });
  }

  submit() {
    if (validForm(this.educationForm).length > 0) {
      this.alertValid = true;
      return;
    }
    this.alertValid = false;
    this.onSubmit.emit(this.educationForm.value);
    return this.modalService.dismissAll();
  }

  closeModal() {
    if (this.educationForm.dirty)
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
        if (!result.value) {
          return this.modalService.dismissAll();
        }
      });
    else {
      return this.modalService.dismissAll();
    }
  }

  onKeypress(e) {
    let input = String.fromCharCode(e.charCode);
    const reg = /^\d*(?:[.,]\d{1,2})?$/;

    if (!reg.test(input)) {
      e.preventDefault();
    }
  }
}
