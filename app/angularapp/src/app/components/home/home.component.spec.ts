import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, FormsModule],
      declarations: [ HomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

fit('Frontend_should_create_home_component', () => {
  expect(component).toBeTruthy();
});

fit('Frontend_should_contain_Farm Financer_heading_in_the_home_component', () => {
  const componentHTML = fixture.debugElement.nativeElement.outerHTML;
  expect(componentHTML).toContain('Farm Financer');
});
});
