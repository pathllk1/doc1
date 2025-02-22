import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast',
  template: `
    <div *ngIf="show" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div class="bg-red-500 text-white p-4 rounded-md shadow-lg">
        {{ message }}
        <button (click)="close()" class="ml-4 text-white underline">Close</button>
      </div>
    </div>
  `,
  styles: []
})
export class ToastComponent {
  @Input() message: string = '';
  show: boolean = false;

  display(message: string) {
    this.message = message;
    this.show = true;
    setTimeout(() => this.close(), 3000); // Automatically close after 3 seconds
  }

  close() {
    this.show = false;
  }
}
