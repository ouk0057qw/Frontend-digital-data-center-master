import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IMyOptions } from 'mydatepicker-th';
import { NgxSpinnerService } from "ngx-spinner";
import { ReportService } from '../../shared/services/report.service';
import { UsersService } from '../../shared/services/users.service';
import { mapPersons } from '../../shared/library/mapList';
import { ExcelService } from '../../shared/services/excel.service';
import { PdfService } from '../../shared/services/pdf.service';
import { AuthlogService } from '../../shared/services/authlog.service';
import {HttpClient} from '@angular/common/http';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-report-searching-board',
  templateUrl: './report-searching-board.component.html',
  styleUrls: ['./report-searching-board.component.css']
})
export class ReportSearchingBoardComponent implements OnInit {

  public searchform: FormGroup;
  ipAddress:any;
  public reportType = 1;
  public page = 1;

  public reportList: any = [];
  public dorp
  public myDatePickerOptions: IMyOptions = {
    dateFormat: 'dd/mm/yyyy',
  };

  public canExportReport = false;

  constructor(
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private reportService: ReportService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private usersService: UsersService,
    private authlogService: AuthlogService,
    private http: HttpClient
  ) {
    this.searchform = this.setSerachForm();
    this.http.get<{ip:string}>('https://jsonip.com').subscribe( data => {this.ipAddress = data})
  }


  async ngOnInit() {
    this.spinner.show();
    const result = ((await this.reportService.getreportboard().toPromise()).data);
    this.reportList = mapPersons(result);
    this.dorp = mapPersons(result)
    this.canExportReport = this.usersService.canExportSearchingBoardReport();
    this.spinner.hide();
  }

  public showAddress(value) {

    const Building = value.Building ? 'อาคาร ' + value.Building + ' ' : '';
    const Floor = value.Floor ? 'ชั้น ' + value.Floor + ' ' : '';
    const Room = value.Room ? 'ห้อง ' + value.Room + ' ' : '';
    const HouseNumber = value.HouseNumber ? 'เลขที่ ' + value.HouseNumber + ' ' : '';
    const Road = value.Road ? 'ถนน ' + value.Road + ' ' : '';
    const Soi = value.Soi ? 'ซอย ' + value.Soi + ' ' : '';
    const Province = value.Province != '' ? 'จังหวัด ' + value.Province + ' ' : '';
    const Subdistrict = value.Subdistrict != '' ? 'ตำบล/แขวง ' + value.Subdistrict + ' ' : '';
    const District = value.District != '' ? 'อำเภอ/เขต ' + value.District + ' ' : '';
    const Zipcode = value.Zipcode != '' ? 'รหัสไปรษณีย์ ' + value.Zipcode + ' ' : '';
    return Building + Floor + Room + HouseNumber + Road + Soi + Province + District + Subdistrict + Zipcode;
  }

  public async searchReport() {
    this.spinner.show();
    if(this.searchform.value != ''){
      this.reportList = mapPersons((await this.reportService.getreportboard().toPromise()).data);
      let filter = this.reportList.filter(report => {
        return (String(report.BoardName)).includes(this.searchform.value.BoardName)
      })
      this.reportList = filter
      this.updateLogSearch(this.searchform.value);
    }

    this.spinner.hide();
  }

  public setSerachForm() {
    return this.formBuilder.group({
      BoardName: [''],
    });
  }

  public convertObjDate(date) {
    return date.year + '-' + date.month + '-' + date.day;
  }


  public exportExcel(data) {
    this.spinner.show();
    const exportGroup = [];
    data.forEach(element => {
      exportGroup.push({
        'ชื่อ-นามสกุล': element.FullnameTh,
        'ชื่อกลุ่ม': element.BoardName,
        'เบอร์โทร': element.Contact,
         'ที่อยู่': this.showAddress(element)
      });
    });
    return this.excelService.exportAsExcelFile(
      exportGroup,
      'report-board'
    );
    this.spinner.hide();
  }
  public exportPDF(data) {
    this.spinner.show();
    const exportGroup = [];
    data.forEach(element => {
      exportGroup.push({
        FullnameTh: element.FullnameTh,
        BoardName: element.BoardName,
        Contact: element.Contact,
        Address: this.showAddress(element)
      });
    });

    let doc = new jsPDF('p', 'pt', 'a4');
    doc = this.pdfService.exportAsPdfile(doc);
    doc.setFont('Kanit-Regular');
     doc.setFontType('normal');
     doc.autoTable({
      styles: { font: 'Kanit-Regular', fontSize: 7},
      headerStyles: { fontStyle: 'Kanit-Regular' },
      columnStyles: {
        0: {columnWidth: 100},
        1: {columnWidth: 60},
        2: {columnWidth: 'auto'},
        3: {columnWidth: 'auto'},
        // etc
      },
      columns: [
        { title: 'ชื่อ-นามสกุล', dataKey: 'FullnameTh' },
        { title: 'ชื่อกลุ่ม', dataKey: 'BoardName' },
        { title: 'เบอร์โทร', dataKey: 'Contact' },
        { title: 'ที่อยู่', dataKey: 'Address' }
      ],

      body: exportGroup
    });
    doc.save('report-board.pdf');
    this.spinner.hide();
  }

  async updateLogSearch(data) {
    var menu = 'ค้นหารายงานการสืบค้นข้อมูลคณะกรรมการ';
    await this.auditLogServiceSearch(data, menu, '', this.ipAddress)
  }
  async auditLogServiceSearch(field, menu, origin, ipAddress) {
    await this.authlogService.insertAuditlog({
      UpdateDate: new Date(),
      UpdateMenu: menu,
      UpdateField:  field.BoardName,
      DataOriginal: origin,
      IpAddress: ipAddress.ip
    }).toPromise()
  }

}
