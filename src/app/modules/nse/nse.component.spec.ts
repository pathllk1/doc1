import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NseComponent } from './nse.component';

describe('NseComponent', () => {
  let component: NseComponent;
  let fixture: ComponentFixture<NseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
