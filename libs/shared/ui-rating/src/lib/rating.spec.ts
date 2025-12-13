import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Rating } from './rating';

describe('Rating', () => {
  let fixture: ComponentFixture<Rating>;
  let component: Rating;
  let componentRef: ComponentRef<Rating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rating],
    }).compileComponents();

    fixture = TestBed.createComponent(Rating);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw error if no rating input is provided', () => {
    expect(() => fixture.detectChanges()).toThrow(
      'NG0950: Input is required but no value is available yet. Find more at https://v20.angular.dev/errors/NG0950'
    );
  });

  it('should display rating', () => {
    componentRef.setInput('rating', 8);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('8');
  });

  it('should set the high class on the mat-icon element when rating is 8', () => {
    componentRef.setInput('rating', 8);
    fixture.detectChanges();

    const icon: HTMLElement | null =
      fixture.nativeElement.querySelector('mat-icon');
    expect(icon).not.toBeNull();
    expect(icon!.classList.contains('rating-icon-high')).toBe(true);
  });

  it('should set the mid class on the mat-icon element when rating is 5', () => {
    componentRef.setInput('rating', 5);
    fixture.detectChanges();

    const icon: HTMLElement | null =
      fixture.nativeElement.querySelector('mat-icon');
    expect(icon).not.toBeNull();
    expect(icon!.classList.contains('rating-icon-mid')).toBe(true);
  });

  it('should set low class on the mat-icon element when rating is 4', () => {
    componentRef.setInput('rating', 4);
    fixture.detectChanges();

    const icon: HTMLElement | null =
      fixture.nativeElement.querySelector('mat-icon');
    expect(icon).not.toBeNull();
    expect(icon!.classList.contains('rating-icon-low')).toBe(true);
  });
});
