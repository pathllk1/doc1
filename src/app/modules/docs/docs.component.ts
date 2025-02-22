import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocsService } from './services/docs.service';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent {
  addForm: FormGroup | any;
  isEdit = false;
  docs: any = [];
  showPopup = false;
  showPopup_edit = false;
  searchText = '';

 
  filteredType: any = [];
  highlightedIndex: number = -1;

  constructor(private fb: FormBuilder, private docsService: DocsService) {
    this.addForm = this.fb.group({
      refno: [''],
      desc: [''],
      sdate: [''],
      edate: ['', Validators.required],
      type: [''],
      val: [''],
      rage:[''],
      id: [''],
      status: ['']
    });
  }


  ngOnInit(): void {
    this.getAll();
      this.docsService.getPosts().subscribe((data: any[]) => {
        console.log(data)
      });
  }

  getAll() {
    this.docsService.getAll().subscribe((data: any[]) => {
      this.docs = data;
      console.log(this.docs)
    });
  }

  onSubmit() {
    if (this.addForm.valid) {
      this.docsService.addTst(this.addForm.value).subscribe((data: any) => {
        console.log(data);
        this.addForm.reset();
        this.getAll();
        this.showPopup = false;
      });
    } else {
      alert('invalid data');
    }
  }

  editDoc(doc: any) {
    this.addForm.patchValue({
      refno: doc.refno,
      desc: doc.desc,
      sdate: this.formatDate(doc.sdate),
      edate: this.formatDate(doc.edate),
      type: doc.type,
      val: doc.val,
      rage: doc.rage,
      id: doc._id,
      status: doc.status
    });
    this.isEdit = true;
    this.openPopup();
  }

  openPopup() { this.showPopup = true; }
  closePopup() {
    this.showPopup = false;
    this.addForm.reset();
    this.isEdit = false;
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  filteredRows() {
    if (!this.searchText) {
      return this.docs;
    }

    return this.docs.filter((row: any) =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(this.searchText.toLowerCase())
      )
    );
  }

  exportToCSV() {
    const csvData = this.docs.map((doc:any) => ({
        RefNo: doc.refno,
        Description: doc.desc,
        StartDate: doc.sdate,
        EndDate: doc.edate,
        Type: doc.type,
        Value: doc.val
    }));

    const csvContent = 'data:text/csv;charset=utf-8,'
        + Object.keys(csvData[0]).join(',') + '\n'
        + csvData.map((e:any) => Object.values(e).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'table_data.csv');
    document.body.appendChild(link);
    link.click();
  }

  deleteDoc(event: Event) {
    event.preventDefault();
    const id = this.addForm.get('id')?.value;
    if (id) {
      const confirmDelete = window.confirm('Are you sure you want to delete this document?');
      if (confirmDelete) {
        this.docsService.deleteDoc(id).subscribe(response => {
          this.closePopup(); 
          this.getAll();// Refresh the list after deletion
        }, error => {
          console.error('Error deleting document:', error);
        });
      }
    }
  }

  getRemainingDaysClass(rage: number): string {
    if (rage >= 60) {
        return 'bg-green-200'; // Green for 60 or more
    } else if (rage >= 41) {
        return 'bg-orange-200'; // Orange for 41 to 59
    } else {
        return 'bg-red-200'; // Red for 40 or less
    }
  }
}
