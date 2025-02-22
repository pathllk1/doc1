import { Component, OnInit,  Inject } from '@angular/core';
import { TstService } from './services/tst.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { TokenStorageService } from './modules/auth/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isLoggedIn = false;
  username?: string;
  addForm: FormGroup | any;
  editForm: FormGroup | any;
  docs: any = [];
  showPopup = false;
  showPopup_edit = false;
  searchText = '';
  isSidebarExpanded = false; // Collapse sidebar by default

  constructor(private tstService: TstService, private fb: FormBuilder, private tokenStorageService: TokenStorageService, @Inject(PLATFORM_ID) private platformId: any) {
    this.addForm = this.fb.group({
      refno: [''],
      desc: [''],
      sdate: [''],
      edate: ['', Validators.required],
      type: [''],
      val: ['']
    });

    this.editForm = this.fb.group({
      refno: [''],
      desc: [''],
      sdate: [''],
      edate: ['', Validators.required],
      type: [''],
      val: [''],
      id: ['']
    });
  }
  title = '15-01-2025';

  ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user.fullName;
    }
  }

  getAll() {
    this.tstService.getAll().subscribe((data: any[]) => {
      this.docs = data;
      console.log(this.docs)
    });
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }

  onSubmit() {
    if (this.addForm.valid) {
      this.tstService.addTst(this.addForm.value).subscribe((data: any) => {
        console.log(data);
        this.addForm.reset();
        this.getAll();
      });
    } else {
      alert('invalid data');
    }
  }

  editDoc(doc: any) {
    this.editForm.patchValue({
      refno: doc.refno,
      desc: doc.desc,
      sdate: this.formatDate(doc.sdate),
      edate: this.formatDate(doc.edate),
      type: doc.type,
      val: doc.val,
      id: doc._id
    });
    this.openPopup_edit();
  }

  openPopup() { this.showPopup = true; }
  openPopup_edit() { this.showPopup_edit = true; }
  closePopup() {
    this.showPopup = false;
    this.addForm.reset();
  }
  closePopup_edit() {
    this.showPopup_edit = false;
    this.editForm.reset();
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  onResize(event: any) {
    if (event.target.innerWidth > 768) { 
      this.isSidebarExpanded = false; 
    } else {
      this.isSidebarExpanded = true; 
    }
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
}
