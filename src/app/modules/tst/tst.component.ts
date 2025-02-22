import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TstService } from './tst.service';

@Component({
  selector: 'app-tst',
  templateUrl: './tst.component.html',
  styleUrls: ['./tst.component.scss']
})
export class TstComponent {
  math = Math;

  blogs = [
    { title: 'Blog Post 1', description: 'Description for blog post 1' },
    { title: 'Blog Post 2', description: 'Description for blog post 2' },
    { title: 'Blog Post 3', description: 'Description for blog post 3' }
  ];

  countries = [
    { name: 'United States', population: 331002651, area: 9833517, capital: 'Washington, D.C.' },
    { name: 'Canada', population: 37742154, area: 9984670, capital: 'Ottawa' },
    { name: 'United Kingdom', population: 67886011, area: 243610, capital: 'London' },
    { name: 'Australia', population: 25499884, area: 7692024, capital: 'Canberra' },
    { name: 'India', population: 1380004385, area: 3287263, capital: 'New Delhi' },
    { name: 'China', population: 1439323776, area: 9596961, capital: 'Beijing' },
    { name: 'Brazil', population: 212559417, area: 8515767, capital: 'Brasília' },
    { name: 'Russia', population: 145912025, area: 17098242, capital: 'Moscow' },
    { name: 'Mexico', population: 128932753, area: 1964375, capital: 'Mexico City' },
    { name: 'Japan', population: 126476461, area: 377975, capital: 'Tokyo' },
    { name: 'Germany', population: 83783942, area: 357022, capital: 'Berlin' },
    { name: 'France', population: 65273511, area: 551695, capital: 'Paris' },
    { name: 'Italy', population: 60244639, area: 301340, capital: 'Rome' },
    { name: 'South Africa', population: 59308690, area: 1219090, capital: 'Pretoria' },
    { name: 'South Korea', population: 51269185, area: 100210, capital: 'Seoul' },
    { name: 'Spain', population: 46754778, area: 505992, capital: 'Madrid' },
    { name: 'Argentina', population: 45195777, area: 2780400, capital: 'Buenos Aires' },
    { name: 'Colombia', population: 50882891, area: 1141748, capital: 'Bogotá' },
    { name: 'Kenya', population: 53771296, area: 580367, capital: 'Nairobi' },
    { name: 'Nigeria', population: 206139589, area: 923768, capital: 'Abuja' },
    { name: 'Egypt', population: 102334155, area: 1002450, capital: 'Cairo' },
    { name: 'Turkey', population: 84339067, area: 783356, capital: 'Ankara' },
    { name: 'Vietnam', population: 97338579, area: 331212, capital: 'Hanoi' },
    { name: 'Philippines', population: 109581078, area: 300000, capital: 'Manila' },
    { name: 'Thailand', population: 69799978, area: 513120, capital: 'Bangkok' },
    { name: 'Iran', population: 83992949, area: 1648195, capital: 'Tehran' },
    { name: 'Iraq', population: 40222493, area: 438317, capital: 'Baghdad' },
    { name: 'Saudi Arabia', population: 34813867, area: 2149690, capital: 'Riyadh' },
    { name: 'Malaysia', population: 32365999, area: 330803, capital: 'Kuala Lumpur' },
    { name: 'Singapore', population: 5850342, area: 728.6, capital: 'Singapore' },
    { name: 'New Zealand', population: 4822233, area: 268021, capital: 'Wellington' },
    { name: 'Portugal', population: 10196709, area: 92212, capital: 'Lisbon' },
    { name: 'Greece', population: 10423054, area: 131957, capital: 'Athens' },
    { name: 'Czech Republic', population: 10708981, area: 78865, capital: 'Prague' },
    { name: 'Hungary', population: 9660351, area: 93030, capital: 'Budapest' },
    { name: 'Sweden', population: 10099265, area: 450295, capital: 'Stockholm' },
    { name: 'Finland', population: 5540720, area: 338424, capital: 'Helsinki' },
    { name: 'Norway', population: 5421241, area: 323802, capital: 'Oslo' },
    { name: 'Denmark', population: 5818553, area: 43094, capital: 'Copenhagen' },
    { name: 'Ireland', population: 4937786, area: 70273, capital: 'Dublin' },
    { name: 'Iceland', population: 366418, area: 103000, capital: 'Reykjavik' },
    { name: 'Ukraine', population: 43733762, area: 603500, capital: 'Kyiv' },
    { name: 'Romania', population: 19237691, area: 238397, capital: 'Bucharest' },
    { name: 'Bulgaria', population: 6948445, area: 110994, capital: 'Sofia' },
    { name: 'Slovakia', population: 5456362, area: 49035, capital: 'Bratislava' },
    { name: 'Croatia', population: 4105267, area: 56594, capital: 'Zagreb' },
    { name: 'Serbia', population: 8772235, area: 77474, capital: 'Belgrade' },
    { name: 'Slovenia', population: 2078654, area: 20273, capital: 'Ljubljana' },
    { name: 'Estonia', population: 1326535, area: 45227, capital: 'Tallinn' },
    { name: 'Latvia', population: 1886198, area: 64559, capital: 'Riga' },
    { name: 'Lithuania', population: 2722289, area: 65301, capital: 'Vilnius' },
    { name: 'Moldova', population: 2657637, area: 33851, capital: 'Chișinău' },
    { name: 'Belarus', population: 9449323, area: 207600, capital: 'Minsk' }
  ];

  blankRow = { name: '', population: 0, area: 0, capital: '' };
  showBlankRow = false;

  filteredCountries: any[] = [];
  searchTerm: string = '';
  activeIndex: number = -1;
  selectedCountryIndex: number = -1;

  currentPage = 1;
  itemsPerPage = 5; // Number of items to display per page

  get paginatedCountries() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.countries.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < Math.ceil(this.countries.length / this.itemsPerPage)) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  constructor(private tstService: TstService) {}

  filterCountries() {
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredCountries = this.countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm)
    );
  }

  autocompleteCountryNames(event: any) {
    const input = (event.target as HTMLInputElement).value; // Type assertion
    const filteredCountries = this.countries.filter(country => 
      country.name.toLowerCase().includes(input.toLowerCase())
    );
    return filteredCountries.map(country => country.name);
  }

  addBlankRow() {
    this.showBlankRow = true;
    this.blankRow = { name: '', population: 0, area: 0, capital: '' };
  }

  updateCountry(index: number) {
    console.log('Blank Row Values:', this.blankRow);
    this.countries[index] = { ...this.countries[index], ...this.blankRow };
    this.blankRow = { name: '', population: 0, area: 0, capital: '' };
    this.showBlankRow = false; // Hide the blank row after updating
  }

  updateCountryData(country: any) {
    console.log('Updating country:', country);
    // Additional logic to update the country can be added here
  }

  updateRowData(rowData: any) {
    console.log('Updating row data:', rowData);
    // Additional logic to update the row data can be added here
  }

  onKeyDown(event: KeyboardEvent, countryName: string) {
    if (event.key === 'Enter') {
      this.searchTerm = countryName;
      this.filteredCountries = [];
      this.activeIndex = -1; // Reset active index
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); // Prevent default scrolling
      this.activeIndex = Math.min(this.activeIndex + 1, this.filteredCountries.length - 1);
      this.selectedCountryIndex = Math.min(this.selectedCountryIndex + 1, this.filteredCountries.length - 1);
      this.searchTerm = this.filteredCountries[this.activeIndex]?.name || '';
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); // Prevent default scrolling
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.selectedCountryIndex = Math.max(this.selectedCountryIndex - 1, 0);
      this.searchTerm = this.filteredCountries[this.activeIndex]?.name || '';
    }
  }

  convertCsvToJson(csvData: string): any[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const jsonArray = lines.slice(1)
      .filter(line => line.trim() !== '') // Filter out empty lines
      .map(line => {
        const values = line.split(',');
        const jsonObject: any = {};
        headers.forEach((header, index) => {
          if (header && values[index] !== undefined) { // Check for undefined
            jsonObject[header.trim()] = values[index].trim();
          } else if (header && values[index] === undefined) {
            jsonObject[header.trim()] = '';
          }
        });
        return jsonObject;
      });
    return jsonArray;
  }

  uploadCsv() {
    const fileInput = <HTMLInputElement>document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const csvData = reader.result as string;
            const jsonArray = this.convertCsvToJson(csvData); // Convert CSV to JSON
            
            const formData = new FormData();
            formData.append('file', new Blob([JSON.stringify(jsonArray)], { type: 'application/json' }), 'data.json'); // Convert JSON to Blob

            this.tstService.uploadFile(jsonArray).subscribe(response => {
                console.log('File uploaded successfully', response);       
            }, error => {
                console.error('Error uploading file', error);
            });
        };
        reader.readAsText(file); // Read the uploaded file as text
    }
  }

  sortDirection: boolean = true; // true for ascending, false for descending
  sortColumn: string = 'name'; // default sort column

  sortData(column: string) {
    this.sortColumn = column;
    this.sortDirection = !this.sortDirection; // toggle sort direction

    this.countries.sort((a:any, b:any) => {
      if (a[column] < b[column]) {
        return this.sortDirection ? -1 : 1;
      }
      if (a[column] > b[column]) {
        return this.sortDirection ? 1 : -1;
      }
      return 0;
    });
  }

  editorContent: string = '';

  formatText(command: string, value?: string) {
    document.execCommand(command, false, value);
  }

  setTextSize(size: string) {
    this.formatText('fontSize', size);
  }

  setTextColor(color: string) {
    this.formatText('foreColor', color);
  }

  alignText(alignment: string) {
    this.formatText('justify' + alignment);
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement; // Type assertion
    const value = inputElement.value; // Access the value
    console.log(value);
  }
}
