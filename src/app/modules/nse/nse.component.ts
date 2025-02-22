import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NSEService } from './nse.service';
import { Subscription } from 'rxjs';
import Chart from 'chart.js/auto';

interface MonthlySummary {
  month: string;
  sum_namt: number;
  sum_cval: number;
}

declare const TradingView: any;

@Component({
  selector: 'app-nse',
  templateUrl: './nse.component.html',
  styleUrls: ['./nse.component.scss']
})
export class NseComponent implements OnInit, OnDestroy {
  showPopup: boolean = false;
  folioData: any[] = [];
  nseRecords: any[] = []; // Variable to hold the NSE records
  nseRecords_all: any[] = [];
  cn_notes: any[] = [];
  documentForm: FormGroup;
  tableData = { cn_no: '', symbol: '', price: '', qnty: '', amt: '', brokerage: '', broker: '', pdate: '', namt: '', folio: '', type: '', rid: "RID" + Date.now(), sector: '' };
  oth_chg1: any;
  famt1: any;
  tot_inv: Number = 1;
  cur_val: Number = 1;
  ovr_gai: Number = 1;
  showDetails: boolean = false;
  Show_cn_note: boolean = false;
  Show_all_rec: boolean = false;
  isEdit = false;
  isLoading = true;
  timeoutId: any;
  dynamicColor: string = '#ff0000'; // Default color
  private subscriptions: Subscription[] = [];
  folioSummary: any[] = [];
  mnthlySummary: any[] = [];
  private chart: Chart | undefined;
  @ViewChild('container', { static: true }) container: ElementRef;
  private widget: any;

  constructor(private fb: FormBuilder, private nseService: NSEService) {
    this.documentForm = this.fb.group({
      id: [''],
      cn_no: ['', Validators.required],
      cn_date: ['', Validators.required],
      broker: ['', Validators.required],
      type: ['EQUITY', Validators.required],
      folio: ['', Validators.required],
      oth_chg: [''],
      famt: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    document.addEventListener('keydown', (e) => {
      const famtInput = document.getElementById('famt') as HTMLInputElement;
      if (famtInput === document.activeElement && e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault(); // Prevent the default save action

        // Create JSON array and log it
        const jsonArray = JSON.stringify(this.nseRecords);
        console.log(jsonArray);
      }
    });

    this.timeoutId = setTimeout(() => {
      this.isLoading = false;
    }, 60000); // Simulate loading time
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
          "autosize": true,
          "symbol": "BSE:SENSEX",
          "interval": "D",
          "timezone": "Asia/Kolkata",
          "theme": "light",
          "style": "2",
          "locale": "en",
          "allow_symbol_change": true,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`;
    this.container.nativeElement.appendChild(script);

    this.initializeData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    console.log(`Number of subscriptions before unsubscribe: ${this.subscriptions.length}`);
  this.subscriptions.forEach(sub => sub.unsubscribe());
  this.subscriptions = []; // Clear the subscriptions array
  console.log(`Number of subscriptions after unsubscribe: ${this.subscriptions.length}`);
  }

  private async initializeData(): Promise<void> {
    try {
      await this.fetchCnNoteData();
      await this.fetchFolioData();
      await this.gs_sheet();
      await this.createMonthlyChart(); // Updated to await the chart creation
      await this.fetchNSERecords();
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }

  private async createMonthlyChart(): Promise<void> {
    try {
      const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      await new Promise<void>((resolve) => {
        // Ensure the canvas is ready in the DOM
        if (this.chart) {
          this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: this.mnthlySummary.map(item => item.month),
            datasets: [
              {
                label: 'Investment',
                data: this.mnthlySummary.map(item => item.sum_namt),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: 'Current Value',
                data: this.mnthlySummary.map(item => item.sum_cval),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Monthly Investment Summary'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Amount'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Month'
                }
              }
            }
          }
        });

        // Wait for the next frame to ensure chart is rendered
        requestAnimationFrame(() => resolve());
      });

      console.log('Chart created successfully');
    } catch (error) {
      console.error('Error creating monthly chart:', error);
      throw error;
    }
  }

  updateCountry(index: number) {
    console.log('Blank Row Values:', this.tableData);
    this.nseRecords[index] = { ...this.nseRecords[index], ...this.tableData };
    this.tableData = {
      symbol: '', price: '', qnty: '', amt: '', brokerage: '',
      cn_no: (document.getElementById('cn_no') as HTMLInputElement).value,
      broker: (document.getElementById('broker') as HTMLInputElement).value,
      pdate: (document.getElementById('cn_date') as HTMLInputElement).value, namt: '',
      folio: (document.getElementById('folio') as HTMLInputElement).value,
      type: (document.getElementById('type') as HTMLInputElement).value,
      rid: "RID" + Date.now(), sector: ''
    };
  }

  updateRowData(rowData: any) {
    // Update rowData with values from documentForm
    rowData.cn_no = this.documentForm.get('cn_no')?.value
    rowData.broker = this.documentForm.get('broker')?.value;
    rowData.pdate = this.documentForm.get('cn_date')?.value;
    rowData.folio = this.documentForm.get('folio')?.value;
    rowData.type = this.documentForm.get('type')?.value;

    // Check if rowData already exists in nseRecords
    const existingRecordIndex = this.nseRecords.findIndex(record => record.symbol === rowData.symbol && record.rid === rowData.rid);
    if (existingRecordIndex !== -1) {
      console.log('UPDATE');
      this.nseRecords[existingRecordIndex] = rowData;
    } else {
      console.log('NEW');
      this.nseRecords.push(rowData);
    }

    // Update tableData with the same values
    this.tableData = {
      cn_no: '',
      symbol: '',
      price: '',
      qnty: '',
      amt: '',
      brokerage: '',
      broker: rowData.broker,
      pdate: rowData.pdate,
      namt: '',
      folio: rowData.folio,
      type: rowData.type,
      rid: "RID" + Date.now(),
      sector: ''
    };

    // Sum the namt values in nseRecords and update famt in documentForm
    const totalNamt = this.nseRecords.reduce((sum, record) => sum + parseFloat(record.namt || 0), 0);
    this.documentForm.get('famt')?.setValue(totalNamt);
    const famt1Input = document.getElementById('famt1') as HTMLInputElement;
    if (famt1Input) {
      famt1Input.value = totalNamt.toString();
    }

    console.log('Updating row data at index:', this.nseRecords.length, rowData);
    const firstInput = document.querySelector('.data-table tbody tr:first-child td input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
    // Additional logic to update the row data can be added here
  }

  deleteRowData(rowData: any) {
    if (confirm('Are you sure you want to delete this row?')) {
      const existingRecordIndex = this.nseRecords.findIndex(record => record.symbol === rowData.symbol && record.rid === rowData.rid);
      if (existingRecordIndex !== -1) {
        this.nseRecords.splice(existingRecordIndex, 1);
      }

      const totalNamt = this.nseRecords.reduce((sum, record) => sum + parseFloat(record.namt || 0), 0);
      this.documentForm.get('famt')?.setValue(totalNamt);
      const famt1Input = document.getElementById('famt1') as HTMLInputElement;
      if (famt1Input) {
        famt1Input.value = totalNamt.toString();
      }

      console.log('Deleting row data at index:', this.nseRecords.length, rowData);
      const firstInput = document.querySelector('.data-table tbody tr:first-child td input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }

  openModal() {
    this.showPopup = true;
    setTimeout(() => {
      const cnNoInput = document.getElementById('cn_no') as HTMLInputElement;
      if (cnNoInput) {
        cnNoInput.focus();
      }
    }, 0);
  }

  closemodal() {
    this.nseRecords = [];
    this.documentForm.reset();
    this.showPopup = false;
    this.isEdit = false;
  }

  async fetchFolioData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sub = this.nseService.getAllFolioRecords().subscribe({
        next: (data: any[]) => {
          this.folioData = data;

          // Create summary by grouping data
          const groupedData = this.folioData.reduce((acc, curr) => {
            if (!acc[curr.symbol]) {
              acc[curr.symbol] = {
                symbol: curr.symbol,
                totalNamt: 0,
                totalCval: 0,
                totalBrokerage: 0,
                totalQnty: 0,
                priceSum: 0,
                count: 0,
                sector: curr.sector || 'Unknown',
                cprice: curr.cprice,
                records: []
              };
            }

            acc[curr.symbol].totalNamt += parseFloat(curr.namt || 0);
            acc[curr.symbol].totalCval += parseFloat(curr.cval || 0);
            acc[curr.symbol].totalBrokerage += parseFloat(curr.brokerage || 0);
            acc[curr.symbol].totalQnty += parseFloat(curr.qnty || 0);
            acc[curr.symbol].priceSum += parseFloat(curr.price || 0);
            acc[curr.symbol].count++;
            acc[curr.symbol].records.push(curr);

            return acc;
          }, {});

          // Convert grouped data to array and calculate averages
          this.folioSummary = Object.values(groupedData).map((group: any) => ({
            symbol: group.symbol,
            namt: Number(group.totalNamt.toFixed(2)),
            cval: Number(group.totalCval.toFixed(2)),
            brokerage: Number(group.totalBrokerage.toFixed(2)),
            qnty: Number(group.totalQnty.toFixed(2)),
            avgPrice: Number((group.priceSum / group.count).toFixed(2)),
            sector: group.sector,
            cprice: group.cprice,
            age: this.calculateAverageAge(group.records),
            gainLoss: Number((group.totalCval - group.totalNamt).toFixed(2))
          }));

          // Calculate overall totals as before
          this.tot_inv = (this.folioData.reduce((sum, record) => sum + parseFloat(record.namt || 0), 0)).toFixed(2);
          this.cur_val = (this.folioData.reduce((sum, record) => sum + parseFloat(record.cval || 0), 0)).toFixed(2);
          this.ovr_gai = Number((Number(this.cur_val.toString()) - Number(this.tot_inv.toString())).toFixed(2));
          this.dynamicColor = this.cur_val > this.tot_inv ? 'green' : 'red';

          console.log('Folio Summary:', this.folioSummary);
          this.mnthlySummary = this.getMonthlySummary(data)
          console.log('Monthly Summary:', this.mnthlySummary);
          resolve();
        },
        error: (error) => {
          console.error('Error loading folio data:', error);
          reject(error);
        }
      });
      this.subscriptions.push(sub);
    });
  }

  getMonthlySummary(records: any): MonthlySummary[] {
    const monthlySummaries: { [key: string]: MonthlySummary } = {};

    records.forEach((record:any) => {
      const pdt = new Date(record.pdate);
        const month = pdt.toISOString().substr(0, 7); // Get YYYY-MM format
        if (!monthlySummaries[month]) {
            monthlySummaries[month] = {
                month,
                sum_namt: 0,
                sum_cval: 0
            };
        }
        monthlySummaries[month].sum_namt += record.namt;
        monthlySummaries[month].sum_cval += record.cval;
    });

    const sortedMonths = Object.keys(monthlySummaries).sort();
    const results: MonthlySummary[] = [];

    for (let i = 0; i < sortedMonths.length; i++) {
        const month = sortedMonths[i];
        const summary = monthlySummaries[month];

        if (i > 0) {
            summary.sum_namt += results[i - 1].sum_namt;
            summary.sum_cval += results[i - 1].sum_cval;
        }

        results.push({
            month,
            sum_namt: summary.sum_namt,
            sum_cval: summary.sum_cval
        });
    }
    return results;
  }

  async gs_sheet(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sub = this.nseService.gs_sheet().subscribe({
        next: (data: any[]) => {
          const gs_rec = data.map(item => ({
            ...item,
            symbol: item.symbol.replace('NSE:', '')
          }));

          if (this.folioData && this.folioData.length > 0) {
            const folioSymbols = new Set(this.folioData.map(item => item.symbol));
            const filtered_gs_rec = gs_rec.filter(item => folioSymbols.has(item.symbol));
            console.log('Filtered GS data:', filtered_gs_rec);
          } else {
            console.log('Processed GS data:', gs_rec);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading GS sheet data:', error);
          reject(error);
        }
      });
      this.subscriptions.push(sub);
    });
  }

  async fetchCnNoteData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sub = this.nseService.getAllCnNote().subscribe({
        next: (data: any[]) => {
          this.cn_notes = data;
          console.log('CN Notes loaded:', this.cn_notes);
          resolve();
        },
        error: (error) => {
          console.error('Error loading CN Notes:', error);
          reject(error);
        }
      });
      this.subscriptions.push(sub);
    });
  }

  async fetchNSERecords(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const sub = this.nseService.getNSERecords().subscribe({
        next: (data) => {
          this.nseRecords_all = data;
          clearTimeout(this.timeoutId);
          this.isLoading = false;
          console.log('NSE Records loaded successfully');
          resolve();
        },
        error: (error) => {
          console.error('Error fetching NSE records:', error);
          alert('Error fetching NSE records: ' + error.message);
          this.isLoading = false;
          reject(error);
        }
      });
      this.subscriptions.push(sub);
    });
  }

  onSubmit() {
    if (this.documentForm.valid) {
      const othChg1Element = document.getElementById('oth_chg1') as HTMLInputElement;
      const famt1Element = document.getElementById('famt1') as HTMLInputElement;
      this.documentForm.get('famt')?.setValue(famt1Element.value);
      this.documentForm.get('oth_chg')?.setValue(othChg1Element.value);
      // Call upsertFolio method from NSEService

      if (!this.isEdit) {
        const sub = this.nseService.submitData(this.documentForm.value, this.nseRecords).subscribe(response => {
          console.log('Folio data submitted:', response);
          // Handle successful submission logic here
        }, error => {
          console.error('Error submitting folio data:', error);
          // Handle error logic here
        });
        this.subscriptions.push(sub);
      } else {
        
        const sub = this.nseService.updateData(this.documentForm.value, this.nseRecords).subscribe(response => {
          console.log('Folio data submitted:', response);
          // Handle successful submission logic here
        }, error => {
          console.error('Error submitting folio data:', error);
          // Handle error logic here
        });
        this.subscriptions.push(sub);
      }

      // Close the popup after submission
      this.closemodal();
    } else {
      // Alert the user with the first error input
      const firstErrorKey = Object.keys(this.documentForm.controls).find(key => this.documentForm.controls[key].invalid);
      if (firstErrorKey) {
        const firstErrorControl = this.documentForm.get(firstErrorKey);
        if (firstErrorControl) {
          alert(`Error in input: ${firstErrorKey}`);
          firstErrorControl.markAsTouched();
        }
      }
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    const focusedElement = document.activeElement as HTMLElement;
    if (event.key === 'Enter') {
      event.preventDefault();
      if (focusedElement.tagName === 'INPUT') {
        const nextElement = this.getNextVisibleElement(focusedElement);
        if (nextElement) {
          nextElement.focus();
        }
      }
    } else if (event.key === 'Escape') {
      if (confirm('Are you sure you want to close the modal?')) {
        this.showPopup = false;
      }
    }
  }

  placeCaret(element: any) {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getNextVisibleElement(current: HTMLElement): HTMLElement | null {
    const focusableElements = Array.from(document.querySelectorAll('input, [contenteditable="true"]')) as HTMLElement[];
    const index = focusableElements.indexOf(current);
    for (let i = index + 1; i < focusableElements.length; i++) {
      if (focusableElements[i].offsetParent !== null) { // Check if the element is visible
        return focusableElements[i];
      }
    }
    return null; // Return null if no visible element is found
  }

  getNextElement(current: HTMLElement): HTMLElement | null {
    const focusableElements = Array.from(document.querySelectorAll('input, [contenteditable="true"]')) as HTMLElement[];
    const index = focusableElements.indexOf(current);
    return focusableElements[index + 1] || null;
  }

  getPreviousElement(current: HTMLElement): HTMLElement | null {
    const focusableElements = Array.from(document.querySelectorAll('input, [contenteditable="true"]')) as HTMLElement[];
    const index = focusableElements.indexOf(current);
    return focusableElements[index - 1] || null;
  }

  calculateAmount(row: any): void {
    if (row.price && row.qnty) {
      row.amt = row.price * row.qnty;
    }
  }
  calculatenAmount(row: any): void {
    if (row.amt !== undefined && row.brokerage !== undefined) {
      row.namt = parseFloat(row.amt) + parseFloat(row.brokerage);
    }
  }

  updateCharges(): void {
    const othChgElement = document.getElementById('oth_chg') as HTMLInputElement;
    const othChg1Element = document.getElementById('oth_chg1') as HTMLInputElement;
    const famtElement = document.getElementById('famt') as HTMLInputElement;
    const famt1Element = document.getElementById('famt1') as HTMLInputElement;

    if (othChg1Element && famt1Element) {
      othChgElement.value = othChg1Element.value;

      const othChgValue = parseFloat(othChg1Element.value) || 0;
      const totalNamt = this.nseRecords.reduce((sum, record) => sum + parseFloat(record.namt || 0), 0);
      const sumValue = othChgValue + totalNamt;

      famtElement.value = Number(sumValue.toString()).toFixed(2);
      famt1Element.value = Number(sumValue.toString()).toFixed(2);
    }
  }

  editCNNote(note: any): void {
    this.isEdit = true;
    this.documentForm.patchValue({
      id: note._id,
      cn_no: note.cn_no,
      cn_date: this.formatDate(note.cn_date),
      broker: note.broker,
      type: note.type,
      folio: note.folio,
      oth_chg: note.oth_chg,
      famt: note.famt
    })

    this.oth_chg1 = note.oth_chg;
    this.famt1 = note.famt;
    this.nseRecords = note.Folio_rec;
    this.openModal();
  }

  private formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  getInvestmentClass(): string {
    return this.cur_val > this.tot_inv ? 'text-green-500' : 'text-red-500';
  }

  private calculateAverageAge(records: any[]): number {
    const now = new Date();
    const totalDays = records.reduce((sum, record) => {
      const purchaseDate = new Date(record.pdate);
      const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Number((totalDays / records.length).toFixed(0));
  }
}
